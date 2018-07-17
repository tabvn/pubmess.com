//
//  ViewController.swift
//  PubMess
//
//  Created by Toan on 7/15/18.
//  Copyright © 2018 Toan. All rights reserved.
//

import UIKit

class ViewController: UIViewController, UITextFieldDelegate {
    
    @IBOutlet weak var textField: UITextField!
    
    
    @IBAction func submit(_ sender: Any) {
    
        
        self.go()
        
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupViews()
        
        
       
    
    
        
        
        
    }

    func go(){
        
        let vc: ChannelViewController = storyboard?.instantiateViewController(withIdentifier: "channelVC") as! ChannelViewController
        
        guard let groupId: String = textField.text else{
        
            return
        }
        
        if groupId == "" {
            
            return
        }
        
        var user: User = User(id: nil, name: "IOS")
        if let _user = PubSub.instance?.user{
            user = _user
        }
        vc.groupId = groupId
        vc.user = user
        self.textField.text = ""
        self.navigationController?.pushViewController(vc, animated: true)
    }
    

    func setupViews(){
      
        
        self.navigationItem.title = "PubMess.com"
    
        let tap: UITapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(UIInputViewController.dismissKeyboard))
        
        view.addGestureRecognizer(tap)
        
        self.textField.delegate = self
        
    }
    
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        
        self.textField.becomeFirstResponder()
        
        
        self.go()
        
        return true
    }
    
    @objc func dismissKeyboard() {
    
        view.endEditing(true)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

