//
//  Message.swift
//  PubMess
//
//  Created by Toan on 7/15/18.
//  Copyright © 2018 Toan. All rights reserved.
//

class Message{
    var body: String
    var user: User
    init(body: String, user: User ) {
        self.body = body
        self.user = user
    }
    
    func toJson() -> [String: Any]{
    
        let message: [String: Any] = [
            "body": body,
            "user": user.toJson()
        ]
       
        
        return message
        
    }
    
}
