const { kMaxLength } = require('buffer');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

/* usernames for first time connection */
var default_usernames = ['Big Boi', 'Injury Reserve', 'BH', 'Yung $ T', 'Earl Sweatshirt', 'RIP Groggs', 'Peggy', 'Buttermilk Jesus', '3 Stacks', 'DJ Half Court Violation', 'Lil World Cup', 'Gangsta Gibbs', 'Quasimoto', 'ATCQ', 'JID', 'EARTHGANG', 'clipping.', 'Smino' , 'Saba', 'Noname', 'Lord Pretty Flacko Jodye', 'Mr. Denzel Curry', 'Kennith Beats', 'Yasiin Bey', 'Ye', 'Cheeky Andy', 'Pulitzer Kenny', 'Aminé', 'DOOM', 'Danny Brown', 'Biggie', 'Pac', 'Ms. Lauryn Hill', 'Channel Tres', 'bbno$', 'Isaiah Rashad', 'Capital Steez', 'Joey Bada$$', 'K.R.I.T.', 'Mac Miller', 'Kota', 'Flatbush Zombie', 'Nasty Nas', 'Cordae', '21', 'the RZA', 'the GZA', 'ODB', 'Inspectah Deck', 'U-God', 'Ghostface Killah', 'the Method Man', 'Raekwon the Chef', 'the Masta Killa'];

/* supported emoticons */
var emoticon_map = {
    ':)': '&#128515;',
    ':(': '&#128577;',
    ':o': '&#128558;'
}

/* keeps track of users */
var users_list = [];

/* keeps past 200 messages */
var chat_log = [];

/* maps socket ids to username and color */
var users_map = new Map();

/* a dummy chat log for testing 200 chat log functionality, plus auto scroll */
var test_chat_log = [ "0-A!A@A#A$A%-0", "1-A!A@A#A$A%-1", "2-A!A@A#A$A%-2", "3-A!A@A#A$A%-3", "4-A!A@A#A$A%-4", "5-A!A@A#A$A%-5", "6-A!A@A#A$A%-6", "7-A!A@A#A$A%-7", "8-A!A@A#A$A%-8", "9-A!A@A#A$A%-9", "10-A!A@A#A$A%-10", "11-A!A@A#A$A%-11", "12-A!A@A#A$A%-12", "13-A!A@A#A$A%-13", "14-A!A@A#A$A%-14", "15-A!A@A#A$A%-15", "16-A!A@A#A$A%-16", "17-A!A@A#A$A%-17", "18-A!A@A#A$A%-18", "19-A!A@A#A$A%-19", "20-A!A@A#A$A%-20", "21-A!A@A#A$A%-21", "22-A!A@A#A$A%-22", "23-A!A@A#A$A%-23", "24-A!A@A#A$A%-24", "25-A!A@A#A$A%-25", "26-A!A@A#A$A%-26", "27-A!A@A#A$A%-27", "28-A!A@A#A$A%-28", "29-A!A@A#A$A%-29", "30-A!A@A#A$A%-30", "31-A!A@A#A$A%-31", "32-A!A@A#A$A%-32", "33-A!A@A#A$A%-33", "34-A!A@A#A$A%-34", "35-A!A@A#A$A%-35", "36-A!A@A#A$A%-36", "37-A!A@A#A$A%-37", "38-A!A@A#A$A%-38", "39-A!A@A#A$A%-39", "40-A!A@A#A$A%-40", "41-A!A@A#A$A%-41", "42-A!A@A#A$A%-42", "43-A!A@A#A$A%-43", "44-A!A@A#A$A%-44", "45-A!A@A#A$A%-45", "46-A!A@A#A$A%-46", "47-A!A@A#A$A%-47", "48-A!A@A#A$A%-48", "49-A!A@A#A$A%-49", "50-A!A@A#A$A%-50", "51-A!A@A#A$A%-51", "52-A!A@A#A$A%-52", "53-A!A@A#A$A%-53", "54-A!A@A#A$A%-54", "55-A!A@A#A$A%-55", "56-A!A@A#A$A%-56", "57-A!A@A#A$A%-57", "58-A!A@A#A$A%-58", "59-A!A@A#A$A%-59", "60-A!A@A#A$A%-60", "61-A!A@A#A$A%-61", "62-A!A@A#A$A%-62", "63-A!A@A#A$A%-63","64-A!A@A#A$A%-64", "65-A!A@A#A$A%-65","66-A!A@A#A$A%-66", "67-A!A@A#A$A%-67", "68-A!A@A#A$A%-68", "69-A!A@A#A$A%-69", "70-A!A@A#A$A%-70", "71-A!A@A#A$A%-71", "72-A!A@A#A$A%-72", "73-A!A@A#A$A%-73", "74-A!A@A#A$A%-74", "75-A!A@A#A$A%-75", "76-A!A@A#A$A%-76", "77-A!A@A#A$A%-77", "78-A!A@A#A$A%-78", "79-A!A@A#A$A%-79", "80-A!A@A#A$A%-80", "81-A!A@A#A$A%-81", "82-A!A@A#A$A%-82", "83-A!A@A#A$A%-83", "84-A!A@A#A$A%-84", "85-A!A@A#A$A%-85", "86-A!A@A#A$A%-86", "87-A!A@A#A$A%-87", "88-A!A@A#A$A%-88", "89-A!A@A#A$A%-89", "90-A!A@A#A$A%-90", "91-A!A@A#A$A%-91", "92-A!A@A#A$A%-92", "93-A!A@A#A$A%-93", "94-A!A@A#A$A%-94", "95-A!A@A#A$A%-95", "96-A!A@A#A$A%-96", "97-A!A@A#A$A%-97", "98-A!A@A#A$A%-98", "99-A!A@A#A$A%-99", "100-A!A@A#A$A%-100","101-A!A@A#A$A%-101", "102-A!A@A#A$A%-102", "103-A!A@A#A$A%-103","104-A!A@A#A$A%-104","105-A!A@A#A$A%-105", "106-A!A@A#A$A%-106", "107-A!A@A#A$A%-107","108-A!A@A#A$A%-108", "109-A!A@A#A$A%-109", "110-A!A@A#A$A%-110", "111-A!A@A#A$A%-111","112-A!A@A#A$A%-112", "113-A!A@A#A$A%-113", "114-A!A@A#A$A%-114", "115-A!A@A#A$A%-115","116-A!A@A#A$A%-116", "117-A!A@A#A$A%-117", "118-A!A@A#A$A%-118", "119-A!A@A#A$A%-119","120-A!A@A#A$A%-120", "121-A!A@A#A$A%-121", "122-A!A@A#A$A%-122", "123-A!A@A#A$A%-123","124-A!A@A#A$A%-124", "125-A!A@A#A$A%-125", "126-A!A@A#A$A%-126", "127-A!A@A#A$A%-127","128-A!A@A#A$A%-128", "129-A!A@A#A$A%-129", "130-A!A@A#A$A%-130", "131-A!A@A#A$A%-131","132-A!A@A#A$A%-132", "133-A!A@A#A$A%-133", "134-A!A@A#A$A%-134", "135-A!A@A#A$A%-135","136-A!A@A#A$A%-136", "137-A!A@A#A$A%-137", "138-A!A@A#A$A%-138", "139-A!A@A#A$A%-139", "140-A!A@A#A$A%-140", "141-A!A@A#A$A%-141", "142-A!A@A#A$A%-142", "143-A!A@A#A$A%-143", "144-A!A@A#A$A%-144", "145-A!A@A#A$A%-145", "146-A!A@A#A$A%-146", "147-A!A@A#A$A%-147", "148-A!A@A#A$A%-148", "149-A!A@A#A$A%-149", "150-A!A@A#A$A%-150", "151-A!A@A#A$A%-151", "152-A!A@A#A$A%-152", "153-A!A@A#A$A%-153", "154-A!A@A#A$A%-154", "155-A!A@A#A$A%-155", "156-A!A@A#A$A%-156", "157-A!A@A#A$A%-157", "158-A!A@A#A$A%-158", "159-A!A@A#A$A%-159", "160-A!A@A#A$A%-160", "161-A!A@A#A$A%-161", "162-A!A@A#A$A%-162", "163-A!A@A#A$A%-163", "164-A!A@A#A$A%-164", "165-A!A@A#A$A%-165", "166-A!A@A#A$A%-166", "167-A!A@A#A$A%-167", "168-A!A@A#A$A%-168", "169-A!A@A#A$A%-169", "170-A!A@A#A$A%-170", "171-A!A@A#A$A%-171", "172-A!A@A#A$A%-172", "173-A!A@A#A$A%-173", "174-A!A@A#A$A%-174", "175-A!A@A#A$A%-175", "176-A!A@A#A$A%-176", "177-A!A@A#A$A%-177", "178-A!A@A#A$A%-178", "179-A!A@A#A$A%-179", "180-A!A@A#A$A%-180", "181-A!A@A#A$A%-181", "182-A!A@A#A$A%-182", "183-A!A@A#A$A%-183", "184-A!A@A#A$A%-184", "185-A!A@A#A$A%-185", "186-A!A@A#A$A%-186", "187-A!A@A#A$A%-187", "188-A!A@A#A$A%-188", "189-A!A@A#A$A%-189", "190-A!A@A#A$A%-190", "191-A!A@A#A$A%-191", "192-A!A@A#A$A%-192", "193-A!A@A#A$A%-193", "194-A!A@A#A$A%-194", "195-A!A@A#A$A%-195", "196-A!A@A#A$A%-196", "197-A!A@A#A$A%-197"];

/* generates a random name from the default usernames */
function randomName() {

    var namesLength = default_usernames.length;

    while(true) {
        var index = Math.floor(Math.random() * namesLength);
        var result = default_usernames[index];
        
        /* check if it is already taken, if it is return that name */
        if(!checkExisting(result)) {
            break;
        }
    }

    return result;
}

/* helper function to replaceEmoticon */
function escapeSpecialChars(regex) {
    return regex.replace(/([()[{*+.$^\\|?])/g, '\\$1');
}

/* replaces all emoticons in a string with emojis */
function replaceEmoticon(msg) {
    for (var i in emoticon_map) {
      var regex = new RegExp(escapeSpecialChars(i), 'gim');
      msg = msg.replace(regex, emoticon_map[i]);
    }
    return msg;
}

/* Creates a timestamp */
function getTimestamp() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();

    var time = `${hours}:${minutes}`;

    return time
}

/* check if a username is already taken */
function checkExisting(name) {

    users_list = getUsersList(users_map);
   
    /* if name is found in list of users, return true */
    if(users_list.indexOf(name) !== -1) {
        return true;
    }

    return false;
}

/* changes a users name to "new_name" */
function nameChange(new_name, socket, id, io) {

    /* get all required info to emit */
    var time = getTimestamp();
    var value = users_map.get(id);
    var temp = value.split(',');
    var old_name = temp[0];
    var style = temp[1];
    users_map.set(id, `${new_name},${style}`);
    users_list = getUsersList(users_map);
    
    /* message to notify user name change is successful */
    var personal_message = `${time} You changed your username from: <span ${style}>${old_name}</span> to: <span ${style}>${new_name}</span>`;
    
    /* message to notify all other users of name change */
    var broadcast_message = `${time} User: <span ${style}>${old_name}</span> changed their username to: <span ${style}>${new_name}</span>`;
    
    /* if the chat log length is 200, remove first element */
    if ( chat_log.length >= 200 ) {
        chat_log.splice(0, 1);
    }

    if( test_chat_log.length >= 200 ) {
        test_chat_log.splice(0, 1);
    }

    /* update chat log */
    test_chat_log.push(`${id}-A!A@A#A$A%-${broadcast_message}`);
    chat_log.push(`${id}-A!A@A#A$A%-${broadcast_message}`);
    
    /* update everything and send appropriate messages */
    io.to(id).emit('set cookie', new_name);
    io.to(id).emit('new user', new_name); 
    io.emit('online users', users_list);
    io.to(id).emit('chat message styled', personal_message); 
    socket.broadcast.emit('chat message', broadcast_message);
}

/* function to change username color to "color" */
function colorChange(id, color) {

    var personal_message = "";
    var time = getTimestamp();

    if(color.length !== 6) {
        personal_message = `${time} Wrong format for color change: ${color}, try format RRGGBB`;
        io.to(id).emit('chat message styled', personal_message); 
    } else {

        /* get, format and change everything related */
        var new_style = `style="color: #${color}"`;
        var value = users_map.get(id);
        var temp = value.split(',');
        var name = temp[0];
        var old_style = temp[1];
        value = `${name},${new_style}`;
        users_map.set(id, value);
        users_list = getUsersList(users_map);

        /* message to notify user color change is successful */
        personal_message = `${time} You changed your username color from: <span ${old_style}>${name}</span> to: <span ${new_style}>${name}</span>`;

        io.to(id).emit('chat message styled', personal_message); 
    }
} 

/* handles commands inputted by user */
function handleCommands(cmd, socket, id, io) {

    /* split message by whitespace */
    var words = cmd.split(" ");
    /* get the command  */
    var command = words[0];

    switch(command) {

        case "/name":
            
            var time = getTimestamp();

            /* get new name from command */
            var new_name = "";
            for( let i = 1; i < words.length; i++) {
                new_name += words[i];
            }

            /* if the name is already taken, let just this user know */
            if(checkExisting(new_name)) {

                var personal_message = `${time} Username: ${new_name} already exists, try another!`;
                io.to(id).emit('chat message styled', personal_message); 

            } else {
                /* else change the users username */
                nameChange(new_name, socket, id, io);
            }
            break;

        case "/color":

            /* get color from command */
            var color = words[1];
            colorChange(id, color);
            break;

        default:
            var time = getTimestamp();
            var personal_message = `${time} Sorry, command: ${command} is not a valid command... try /name NEW USERNAME or /color RRGGBB`;
            io.to(id).emit('chat message styled', personal_message); 
            break;

    }
}

/* get the an array of users from the users_map */
function getUsersList(map) {

    var temp = [];
    for(let value of map.values()) {
        var words = value.split(',');
        temp.push(words[0]);
    }

    return temp;
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

    /* get socket id */
    var id = socket.id;
    var style = 'style="color: #000000"';

    /* get current time */
    var time = getTimestamp();
    var username = "";
    var name_message = "";

    /* check if cookie has been set */
    io.to(id).emit('check cookie');
    
    socket.on('check cookie', (cookie) => {

        var username_pos = cookie.search('username=');
        if(username_pos !== -1) {
            /* get cookie value, format is 'username=<a username>' */
            var value = "";
            for(var i = username_pos; i < cookie.length; i++) {
                value += cookie[i];
            }

            /* split by '=' and get username */
            var temp = value.split('=');
            username = temp[1];

            /* check if name has been taken since disconnect */
            if(checkExisting(username)) {

                name_message = `${time} Username: ${username} has been taken since you left, so we assigned you a random one instead!`;
                username = randomName();
                io.to(id).emit('set cookie', username);

            } 
        } else {
            /* Get random name from defaults, checks for existence */
            username = randomName();

            /* set cookie with this username */
            io.to(id).emit('set cookie', username);
        }
        
        var value = `${username},${style}`;
    
        /* map new user to their socket id */
        users_map.set(id, value);
    
        /* get users list from mapped users */
        users_list = getUsersList(users_map);
    
        /* construct messages */
        var broadcast_message = `${time} User: <span ${style}>${username}</span> has joined the chat!`;
        var personal_message = `${time} Hello <span ${style}>${username}</span>! Welcome to the chat, here is the last 200 messages you've missed!`;
    
        /* send the user the users list */
        io.to(id).emit('new user', username); 
        io.emit('online users', users_list);
    
        /* send chat log to user */
        //io.to(id).emit('chat log', test_chat_log);
        io.to(id).emit('chat log', chat_log); 
    
        /* if username has been taken in mean time let the user know */
        if(name_message !== "") {
            io.to(id).emit('chat message styled', name_message);
        } 

        /* send welcoming message to user */
        io.to(id).emit('chat message styled', personal_message); 
    
        /* tell all other users this user has connected */
        socket.broadcast.emit('chat message', broadcast_message);

        /* if the chat log length is 200, remove first element */
        if ( chat_log.length >= 200 ) {
            chat_log.splice(0, 1);
        }
        
        if( test_chat_log.length >= 200 ) {
            test_chat_log.splice(0, 1);
        }
    
        test_chat_log.push(`${id}-A!A@A#A$A%-${broadcast_message}`);
        chat_log.push(`${id}-A!A@A#A$A%-${broadcast_message}`);
    
    });

    socket.on('disconnect', () => {

        /* find this user and remove them from list of online users */
        var id = socket.id;
        var value = users_map.get(id);
        var words = value.split(",");
        var username = words[0];
        var style = words[1];
        users_map.delete(id);
        users_list = getUsersList(users_map);

        /* construct message */
        var broadcast_message = `${time} User: <span ${style}>${username}</span> has left the chat...`;

        /* if the chat log length is 200, remove first element */
        if ( chat_log.length >= 200 ) {
            chat_log.splice(0, 1);
        }
        
        if( test_chat_log.length >= 200 ) {
            test_chat_log.splice(0, 1);
        }

        /* includes a key that will be parsed out when printing chat log, for indicating who said what */
        test_chat_log.push(`${id}-A!A@A#A$A%-${broadcast_message}`);
        chat_log.push(`${id}-A!A@A#A$A%-${broadcast_message}`);

        /* update online users list, and tell other users this user has disconnected */
        io.emit('online users', users_list);
        socket.broadcast.emit('chat message', broadcast_message);
    });
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {

        /* handle emoticons */
        msg = replaceEmoticon(msg);

        /* get socket id */
        var id = socket.id;

        /* if a user input a command, handle it  */
        if(msg[0] === "/") {

            handleCommands(msg, socket, id, io);

        } else {

            /* get current time and construct message */
            var time = getTimestamp();
            var value = users_map.get(id);
            var words = value.split(',');
            var name = words[0];
            var style = words[1];
            var broadcast_message = `${time} <span ${style}>${name}:</span> ${msg}`;

            /* if the chat log length is 200, remove first element */
            if ( chat_log.length >= 200 ) {
                chat_log.splice(0, 1);
            }

            if( test_chat_log.length >= 200 ) {
                test_chat_log.splice(0, 1);
            }
        
            /* add this message to the chat log */
            test_chat_log.push(`${id}-A!A@A#A$A%-${broadcast_message}`);
            chat_log.push(`${id}-A!A@A#A$A%-${broadcast_message}`);

            /* emit a styled message for this user */
            io.to(id).emit('chat message styled', broadcast_message);
            /* emit regular message to all other users */
            socket.broadcast.emit('chat message', broadcast_message);
        }
    });
});

http.listen(3000, () => {
    console.log('listening on port: 3000');
});