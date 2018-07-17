//
//  MessageQueue.swift
//  PubMess
//
//  Created by Toan on 7/17/18.
//  Copyright © 2018 Toan. All rights reserved.
//

import Foundation
enum MessageQueueType: String {
    case Message = "message"
}
class MessageQueue {
    
    var type: MessageQueueType
    var payload: Any
    
    init(type: MessageQueueType, payload: Any) {
        self.type = type
        self.payload = payload
    }
}
