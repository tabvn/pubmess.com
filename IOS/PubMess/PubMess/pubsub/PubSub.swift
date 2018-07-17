//
//  PubSub.swift
//  PubMess
//
//  Created by Toan on 7/15/18.
//  Copyright © 2018 Toan. All rights reserved.
//

import Foundation
import UIKit

extension String{
    func toDictionary() -> NSDictionary {
        let blankDict : NSDictionary = [:]
        if let data = self.data(using: .utf8) {
            do {
                return try JSONSerialization.jsonObject(with: data, options: []) as! NSDictionary
            } catch {
                print(error.localizedDescription)
            }
        }
        return blankDict
    }
}


class PubSub: NSObject,SRWebSocketDelegate{
    
    
    var url: URL

    var connected: Bool = false
    var willReconnect = true
    var reconnecting = false
    var timer: Timer?
    var user: User?
    
    static var topics: [String] = []
    static var subscriptions: [Subscription] = []
    var websocket: SRWebSocket

    var queue: [MessageQueue] = []
    
    static var instance: PubSub?
    

    init(url: URL!){
    
        self.websocket = SRWebSocket(url: url)
        self.url = url
        
    
        
    }
    
    func setUser(user: User?){
        
        self.user = user
        
        var userData = [String: Any]()
        
        if let user = user{
            
            userData = user.toJson()
        }
    
        let payload: [String: Any?] = ["action": "connect", "payload": ["user": userData]]
        self.send(message: payload)
        
        
    }
    
    
    func connect(){
        
        PubSub.instance = self
    
        if(self.websocket.readyState == SRReadyState.OPEN){
            
            return
        }
        
        self.willReconnect = true
        
        self.websocket.delegate = self
        
        self.websocket.open()
    
        timer = Timer.scheduledTimer(timeInterval: 3, target: self, selector: #selector(checkAndReconnect), userInfo: nil, repeats: true)

    
    }
    
    @objc func checkAndReconnect(){
        
    
        self.reconnect()
        
    }
    func reconnect(){
        
        if(self.websocket.readyState == SRReadyState.OPEN){
            return
        }
        self.websocket.delegate = nil
        if(self.websocket.readyState == SRReadyState.OPEN){
            self.websocket.close()
        }
        
        self.reconnecting = true
        self.connected = false
        self.websocket = SRWebSocket(url: url)
        self.connect()
        
    
        
        
    }
    
    func webSocketDidOpen(_ webSocket: SRWebSocket!) {
        self.connected = true
        self.reconnecting = false
        
        print("Connected")
        self.send(message: "hi server")
        
        self.send(message: "{\"action\": \"subscribe\"}")
        
        self.runQueue()
    }
    
    func webSocket(_ webSocket: SRWebSocket!, didFailWithError error: Error!) {
        self.connected = false
        
        print("Connection is error", error)
    }
    func webSocket(_ webSocket: SRWebSocket!, didCloseWithCode code: Int, reason: String!, wasClean: Bool) {
        print("Connection is closed", reason)
        
        if(self.willReconnect){
            self.reconnect()
        }
        self.connected = false
        
        
        
    }
    
    func send(message: Any){
        
      

        if(self.websocket.readyState == SRReadyState.OPEN){
            
            // send to server
            if let theMessgeString: String = self.distToJsonString(message: message){
                 self.websocket.send(theMessgeString)
            }
           
        }else{
            
            // let do in queue
            let newQueue = MessageQueue(type: .Message, payload: message)
            self.queue.append(newQueue)
        }
        
        
        
    }
    
    func runQueue(){
        
        var i: Int = 0
        
        for item in queue {
            if(item.type == .Message){
                self.send(message: item.payload)
            }
            
            queue.remove(at: i)
            
            i += 1
        }
    }
    
    func webSocket(_ webSocket: SRWebSocket!, didReceiveMessage message: Any!) {
        
        
        if let msg: String = message as? String{
             self.onReceiveMessage(message: msg)
        }
       
    }
    

    
    func onReceiveMessage(message: String){
        
        let msg: NSDictionary = message.toDictionary()
        
        if let action: String = msg["action"] as? String{
            
            switch action{
                
            case "publish":
                
                
                // let find all subscription and send callback
                
                if let payload: [String: Any] = msg["payload"] as? [String: Any]{
                    
                    if let topic: String = payload["topic"] as? String {
                        
                        let topicSubscriptions = PubSub.subscriptions.filter({$0.topic == topic})
                        
                        if let messageData: Any = payload["message"]{
                            
                            for sub in topicSubscriptions{
                                sub.callback(messageData)
                            }
                        }
                        
                    }
                    
                }
                
                return
                
            default:
                
                return
            }
        }
        
    }
    func disconnect(){
        self.connected = false
        self.willReconnect = false
        
        self.websocket.delegate = nil
        self.websocket.close()
        
        self.timer?.invalidate()
    }
    
    static func subscribe(topic: String, callback: @escaping (_ message: Any) -> Void) -> Subscription{
        
        if PubSub.topics.contains(topic){
            PubSub.topics.append(topic)
        }
    
        let subscription = Subscription(topic: topic, callback: callback)
       PubSub.subscriptions.append(subscription)
        
        let payload: [String: Any] = ["action": "subscribe", "payload": ["topic": "\(topic)"]]
            
        PubSub.instance?.send(message: payload)
        
        return subscription
    }
    
    static func publish(topic: String, message: Any){
        
    
        
        let payload: [String: Any] = ["action": "publish", "payload": ["topic": "\(topic)", "message": message]]
    
    
         PubSub.instance?.send(message: payload)
        
        
        
    }
    
    static func broadcast(topic: String, message: Any){
        
        let payload: [String: Any] = ["action": "broadcast", "payload": ["topic": "\(topic)", "message": message]]
        
        
        PubSub.instance?.send(message: payload)
        
        
        
    }
    
    func distToJsonString(message: Any) -> String?{
        var theMessage: String = ""
        
        if let str :String = message as? String{
            
            theMessage = str
        }else{
            let jsonData = try? JSONSerialization.data(withJSONObject: message, options: [])
            theMessage = String(data: jsonData!, encoding: .utf8)!
            
        }
        
        return theMessage
        
    }
    
    static func unsubscribe(topic: String){
        
        let subscriptions: [Subscription] = PubSub.subscriptions.filter { $0.topic == topic}
    
        for subscription in subscriptions {
            subscription.remove()
        }
        
        if let  index =  topics.index(of: topic){
            self.topics.remove(at: index)
        }
        
        
        
    }


    deinit {
        self.timer?.invalidate()
    }
    
    
}
