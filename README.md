# pubmes.com

See Demo at: https://pubmess.com

Video: https://www.youtube.com/watch?v=lZZnX-8StXc
## Start Api for development

```
cd api
npm install
npm run dev

```

## Start Web App

```
cd app

npm install

npm start

```


## IOS App

```
cd IOS/PubMess
pod install
open PubMess.xcworkspace
```



Made Easy in Swift 4 Pubsub client

init PubSub

```swift

 let websocketUrl = URL(string: "wss://pubmess.com")
 let pubSub =  PubSub.init(url: websocketUrl)
 pubSub?.connect()


```

Subscribe a topic

``` swift
const subscription = PubSub.subscribe(topic: "topic-abc/users",  { (message: Any) in
 
 print("Received message from topic", message)
 
}

```

// if want to ubsubscribe or remove subscription
```swift
subscription.remove() 
```
or 

```swift
PubSub.unsubscribe("topic-abc/users")

```



Publish a message to topic 

```swift
PubSub.publish(topic: "topic-abc/users", message: ["user": "Toan Nguyen Dinh"])

```



Broadcast a message to topic , This is send a message to every one is subscribed this topic but exclude sender. 

```swift
PubSub.broadcast(topic: "topic-abc/users", message: ["user": "Toan Nguyen Dinh"])
```



## Video Playlist

https://www.youtube.com/playlist?list=PLFaW_8zE4amNkFbpUVS3V0t_HrJSQdASD
