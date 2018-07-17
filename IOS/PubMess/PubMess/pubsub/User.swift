//
//  User.swift
//  PubMess
//
//  Created by Toan on 7/15/18.
//  Copyright © 2018 Toan. All rights reserved.
//

import Foundation

class User{
    
    var name: String
    var id: String
    init(id: String? , name: String) {
        self.name = name
        self.id =  (id != nil)  ? id! : UUID().uuidString
    }
    func toJson() ->[String: Any]{
        
        return [
            "id": id,
            "name": name
        ]
    }
}
