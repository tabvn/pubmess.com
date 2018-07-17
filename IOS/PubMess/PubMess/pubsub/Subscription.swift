//
//  Subscription.swift
//  PubMess
//
//  Created by Toan on 7/15/18.
//  Copyright © 2018 Toan. All rights reserved.
//

import Foundation

class Subscription{
    
    var id: String
    var topic: String
    var callback: (_ message: Any) -> Void

    
    init(topic: String, callback: @escaping (_ message: Any)-> Void) {
        
        self.topic = topic
        self.callback = callback
        self.id = UUID().uuidString
    }
    
    func remove(){
        
        if  let _index = PubSub.subscriptions.index(where: {$0.id == self.id}){
            PubSub.subscriptions.remove(at: _index)
        }
        
    }
}
