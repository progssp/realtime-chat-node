var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];

app.get('/',function(req,res){
    res.sendFile(__dirname + '/view/index.html');
});

io.on('connection',function(socket){
    //console.log('user connected');
    var nm;
    
    socket.on('joined',function(user_data){
        nm = user_data.name;
        io.emit('joined_response',nm);
        console.log(user_data.name+" joined");        
        socket.join(user_data.name);
        users.push(user_data.name);
        console.log(users);
        for(var i=0;i<users.length;i++){
            io.to(users[i]).emit('refresh_users',users);
        }
    });

    socket.on('send_msg',function(user_signed_in,current_user,msg){
        io.to(user_signed_in).to(current_user).emit('sent_msg',user_signed_in,current_user,msg);
    });

    socket.on('typing_to_server',function(sender,typing_status){
        io.emit('typing_to_client',sender,typing_status);
    });
    
    
    socket.on('disconnect',function(){
        console.log(nm+' user disconnected');
        for(var i=0;i<users.length;i++){
            if(users[i] == nm){
                users.splice(i,1);
            }
        }
        for(var i=0;i<users.length;i++){
            io.to(users[i]).emit('refresh_users',users);
        }
        console.log("remaining users : "+users);
        io.emit('disconnect_response',nm);
    });
});

http.listen(3000,function(){
    console.log('on port : 3000');
});