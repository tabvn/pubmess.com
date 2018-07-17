import UIKit
import SlackTextViewController


class ChannelViewController: SLKTextViewController {
    var groupId: String!
    var messages = [Message]()
    var user: User!

    var subscriptions: [Subscription] = []
    
    override var tableView: UITableView {
        get { return super.tableView! }
    }
    
   
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        
        self.setupViews()
        
        self.subscribe()
        
        
        
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        
        self.unsubscribe()
    }
    
    private func subscribe(){
    
        
        
        PubSub.publish(topic: "\(groupId!)/users", message: ["user": self.user.toJson()])
        
        
        if let _ = PubSub.instance?.connected{
            
            messages.append(Message(body: "Welcome to channel: https://pubmess.com/\(groupId!), happy chatting!", user: User(id: nil, name: "PubMess.com")))
        }
        
        if let _user = PubSub.instance?.user{
            self.user = _user
        }else{
            
            PubSub.instance?.setUser(user: user)
        }
        
        
        
        let messageTopic = "groups/\(groupId!)/messages"
        
        let messageSubscription = PubSub.subscribe(topic: messageTopic) { (message: Any) in
            
            
            let message: [String: Any] = message as! [String: Any]
            let messageUser: [String: Any] = message["user"] as! [String: Any]
            
            guard let body: String = message["body"] as? String else {
                
                return
            }
        
            let _user = User(id: messageUser["id"] as? String, name: messageUser["name"] as! String)
            let msg: Message = Message(body: body, user: _user)
                
            self.newMessage(message: msg)
                
        
            
        
        }
        
       
        
        
        let userJoinSubscription = PubSub.subscribe(topic: "\(groupId!)/users") { (message: Any) in
            
        
            guard let message: [String: Any] = message as? [String: Any] else{
                
                return
            }
            guard let _user: [String: Any] = message["user"] as? [String: Any] else {
                
                return
            }
            
            if let name: String = _user["name"] as? String{
                let userJoinMessage: Message = Message(body: "\(name) joined the conversation.", user: User(id: nil, name: "PubMess.com"))
                self.newMessage(message: userJoinMessage)
            }
            
           
        }
    
        // add to list and use for unsubscribe later
        subscriptions.append(messageSubscription)
        subscriptions.append(userJoinSubscription)
        
        
    }
    
    private func unsubscribe(){
        
        for sub in subscriptions {
            sub.remove()
        }
        
    }
    private func setupViews() -> Void {
        
        // nav
        
        self.title =  "Messages"
        
        
        self.navigationItem.leftBarButtonItem = UIBarButtonItem(title: "Back", style: UIBarButtonItemStyle.plain, target: self, action: #selector(_back))
        
        // messages view
        self.bounces = true
        self.isInverted = true
        self.shakeToClearEnabled = true
        self.isKeyboardPanningEnabled = true
        self.textInputbar.maxCharCount = 256
        self.tableView.separatorStyle = .none
        self.textInputbar.counterStyle = .split
        self.textInputbar.counterPosition = .top
        self.textInputbar.autoHideRightButton = true
        self.textView.placeholder = "Enter Message...";
        self.shouldScrollToBottomAfterKeyboardShows = true
        self.textInputbar.editorTitle.textColor = UIColor.darkGray
        self.textInputbar.editorRightButton.tintColor = UIColor(red: 0/255, green: 122/255, blue: 255/255, alpha: 1)
        
        self.tableView.register(MessageCell.classForCoder(), forCellReuseIdentifier: MessageCell.MessengerCellIdentifier)
        
        
        
    }
    @objc func _back(){
        
        self.navigationController?.popViewController(animated: true)
    }
    override func didPressRightButton(_ sender: Any!) {
        self.textView.refreshFirstResponder()
        self.sendMessage(body: textView.text)
        super.didPressRightButton(sender)
        
    }
    
    
    func sendMessage(body: String){
        
        let message = Message(body: body, user: self.user)
        
        newMessage(message: message)
        
        let messageTopic = "groups/\(groupId!)/messages"
        
        PubSub.broadcast(topic: messageTopic, message: message.toJson())
        
        let str = body.lowercased()
        
        if str.hasPrefix("set name") {
        
            let arr = body.split(separator: "=")
            if var name: String = String(arr[1]) as String?{
                name = name.trimmingCharacters(in: .whitespacesAndNewlines)
                name = name.replacingOccurrences(of: "“", with: "", options: String.CompareOptions.literal, range: nil)
                name = name.replacingOccurrences(of: "“", with: "", options: String.CompareOptions.literal, range: nil)
                
                self.user.name = name
                PubSub.instance?.setUser(user: self.user)
            }
            
        }
        if str == "clear" || str == "c" {
            self.clear()
        }
        
        
    }
    public func newMessage(message: Message) {
        
    
        let indexPath = IndexPath(row: 0, section: 0)
        let rowAnimation: UITableViewRowAnimation = self.isInverted ? .bottom : .top
        let scrollPosition: UITableViewScrollPosition = self.isInverted ? .bottom : .top
        
        DispatchQueue.main.async {
            self.tableView.beginUpdates()
            self.messages.insert(message, at: 0)
            self.tableView.insertRows(at: [indexPath], with: rowAnimation)
            self.tableView.endUpdates()
            
            self.tableView.scrollToRow(at: indexPath, at: scrollPosition, animated: true)
            self.tableView.reloadRows(at: [indexPath], with: .automatic)
            self.tableView.reloadData()
        }
    }
    func clear(){
        
        self.messages.removeAll()
        self.tableView.reloadData()
    }
    
    
    
    
    override class func tableViewStyle(for decoder: NSCoder) -> UITableViewStyle {
        return .plain
    }
    
    override func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    
    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if tableView == self.tableView {
            return self.messages.count
        }
        
        return 0
    }
    
    
    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = self.tableView.dequeueReusableCell(withIdentifier: MessageCell.MessengerCellIdentifier) as! MessageCell
        let message = self.messages[(indexPath as NSIndexPath).row]
        
        cell.bodyLabel().text = message.body
        cell.titleLabel().text = message.user.name
        
        cell.usedForMessage = true
        cell.indexPath = indexPath
        cell.transform = self.tableView.transform
        
        return cell
    }
    
    
    
    
}



