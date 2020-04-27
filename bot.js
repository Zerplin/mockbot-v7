//const keepAlive = require('./server');
const Discord   = require('discord.js');
const bot       = new Discord.Client();
const fs        = require('fs');

require('dotenv').config();

const DBL = require("dblapi.js");
const dbl = new DBL(process.env.apikey, bot);

var mockList = [];
var userList = [];
var talkedRecently = [];
var guildCooldown = [];
var guildList = [];

var skip = 0;
var cooldown =1;
var timeout = 10;

const prefix = "!";

function kFormatter(num) {
  return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num)
}

//const lastMessages   = new Discord.Collection();
const guildMessageList = new Discord.Collection();
const lastMessageList  = new Discord.Collection();

bot.on("ready", () => {
  console.log("Ready");
  
  userList = bot.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)
  userList = kFormatter(userList);
  bot.user.setActivity('cmd|mocking '+userList+" users", { type: 'LISTENING' });

  console.log(userList)
  console.log(bot.guilds.cache.size)
})

function mockingSpongebob(text) {
  var res = "";
  var next = Math.floor(Math.random() * 3) + 1; // random number from [1,3]
  for (var i = 0; i < text.length; ++i) {
    if (i === next) {
      res += text.charAt(i).toUpperCase();
      next += Math.floor(Math.random() * 3) + 1;
    } else {
      res += text.charAt(i);
    }
  }
  return res;
}

bot.on('message', (message) => 
{

  if(!message.guild){

    console.log("dms","|",message.author.tag,"|", message.content)

    if(message.content.includes("help")){
      message.channel.send("commands can be found here: https://discordbots.org/bot/605882759772241988 , and while youre in there ᵖˡˢ ᵛᵒᵗᵉ \nAdd me to your server here <http://bit.ly/MockInv>");
    }

  }
  
  if(message.guild){
    guildMessageList.set(message.guild.id, lastMessageList.set(message.author.id, message))
  }

  if (message.content.startsWith(prefix)&&message.guild != null) 
  {
    
    if (!message.author.bot) 
    {

      if(!talkedRecently.includes(message.channel.guild.id))
      {
        talkedRecently.push(message.channel.guild.id);
        talkedRecently[message.channel.guild.id]=[];
      }

      if (message.content.toLowerCase().includes("help") || message.content.toLowerCase().includes("command") || message.content.toLowerCase().includes("cmd")) 
      {
        message.channel.send("commands can be found here: https://discordbots.org/bot/605882759772241988 ᵖˡˢ ᵛᵒᵗᵉ \nAdd me to your server <http://bit.ly/MockInv>");
        
        userList = bot.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)
        userList = kFormatter(userList);
        bot.user.setActivity('!cmd|mocking '+userList+" users", { type: 'LISTENING' });
      }
  
      if (message.content.toLowerCase().includes("getserver")&&message.author.id == "165937223554826241") 
      {
        var serverList = bot.guilds.cache.sort((a,b) => b.memberCount - a.memberCount).first(9999).map((g, index) => `${index + 1}. ${g.name}: ${g.memberCount}`).join('\n')
        message.channel.send("i am in " + bot.guilds.cache.size + " servers\n");
        message.channel.send(serverList, {split:true});

      }
        //----------------------------------------------------------------------------------------------------------------------------------------

      if (message.content.toLowerCase().includes("stop mock") || message.content.toLowerCase().includes("unmock")) 
      {

        if (message.mentions.users.first()) 
        {
          console.log("mention check: " + message.mentions.users.first());

          console.log("before removal " + mockList);

          mockList = mockList.filter(user => user != message.mentions.users.first().id);

          console.log("to be removed " + message.mentions.users.first().id);
          console.log("removed " + mockList);

          message.channel.send(mockingSpongebob("unmocking " + message.mentions.users.first().username));

          skip = 1;
        }

        else 
        {
          console.log("author check: " + message.author);

          console.log("before removal " + mockList);

          mockList = mockList.filter(user => user != message.author.id);

          console.log("to be removed " + message.author.id);
          console.log("removed " + mockList);

          message.channel.send(mockingSpongebob("unmocking " + message.author.username));
        }
        return(null);
      }

      if(message.content.toLowerCase().startsWith("!mock cooldown"))
      {
        console.log("flg1 "+message.content);
        if(message.member.hasPermission("KICK_MEMBERS"))
        {
          console.log("flg2 :"+message.content.slice(15));
          var answer = parseInt(message.content.slice(15));
          if(Number.isInteger(answer))
          {
            //timeout = answer;
            message.channel.send("mock cooldown changed to "+ answer +" seconds");

            if(!guildCooldown.includes(message.channel.guild.id))
            {
              guildCooldown.push(message.channel.guild.id);
            }

            guildCooldown[message.channel.guild.id] = answer;

            if(!talkedRecently.includes(message.channel.guild.id))
            {
              talkedRecently.push(message.channel.guild.id);
              
            }

            talkedRecently[message.channel.guild.id] = [];
            /*
            console.log("before clear :"+talkedRecently);
            talkedRecently =new Set([]);
            console.log("after clear :"+talkedRecently);
            */
          }
          else
          {
            message.channel.send("invalid input, did you remember to add a number?");
            console.log("invalid input :"+answer);
          }
          
        }

        else
        {
          message.channel.send("Only administrators and moderators can change mock cooldown")
        }

        return(null);
      }

      //-----------------------------------------------------------------------------------------------------
      //if (talkedRecently.has(message.author.id) && cooldown==1 && message.content.startsWith("!mock"))
      //console.log("arr :"+talkedRecently[message.channel.guild.id]);
      if (talkedRecently[message.channel.guild.id].includes(message.author.id) && cooldown==1 && message.content.startsWith("!mock")) 
      {
        var minutes = Math.floor(guildCooldown[message.channel.guild.id]/60);
        var seconds = guildCooldown[message.channel.guild.id] - minutes*60
        message.author.send("Cooldown enabled, wait "+minutes+" minute(s) and "+seconds+ " second(s) before mocking again. - " + message.author.username)
        message.delete()
        .then(msg => console.log(`Deleted message from ${msg.author.username}`))
        .catch(console.error);

        console.log(talkedRecently);
      }
      
      else 
      {
        if(message.mentions.users.first())
        {
          if (message.content.toLowerCase().includes("mock") && !mockList.includes(message.mentions.users.first().id)) 
          {
            if (message.content.toLowerCase().includes(" all")) 
            {
              if(!message.mentions.users.first().bot)
              {
                dbl.hasVoted(message.author.id).then(voted => {
                  if (voted || message.author.id == "165937223554826241" || message.author.id == "386479886463664132") 
                  {
                    message.channel.send("Thank you for voting!")  

                    mockList.push(message.mentions.users.first().id)

                    console.log("added " + mockList);
        
                    message.channel.send(mockingSpongebob("mocking " + message.mentions.users.first().username))
        
                    skip = 1;
                  }
                  else if(!voted)
                  {
                    message.channel.send("unlock this command by voting here "+ "https://discordbots.org/bot/605882759772241988 "+"ᴵᵗ ᶜᵃⁿ ᵗᵃᵏᵉ ᵃ ᶠᵉʷ ᵐᶦⁿᵘᵗᵉˢ ᵗᵒ ᵘᵖᵈᵃᵗᵉ")
                  }
                });
              } 
              else
              {
                message.channel.send("sorry, I can't <mock all> a fellow bot");
              }

            }
            else 
            { 
              //console.log("test mention", message.mentions.users)
              if(message.mentions.users.first().lastMessageID === null)
              {
                 console.log("lastMessage is null")
                 try{
                    message.channel.send(mockingSpongebob(guildMessageList.get(message.guild.id).get(message.mentions.users.first().id).content))
                 }
                 catch(err)
                 {
                    message.channel.send("Error log: no message cached from mentioned user. Is this message from before I was added? Pls contact creator or join support server for further help")      
                 }
              }
              else
              {
                 console.log("lastMessage exist")
                 try{
                    message.channel.send(mockingSpongebob(message.mentions.users.first().lastMessage.content));
                    
                 }catch(err){
                    message.channel.send("Error log: no message cached from mentioned user. Is this message from before I was added? Pls contact creator or join support server for further help")
                 }
              }
            }
          }
        }
        //--------------------------------------------------------------------------------------------------------
        else if (message.content.toLowerCase().includes("mock")) 
        {
          
          if(message.content.length>6)
          {
            console.log("embedded mock :"+message.content);
            message.channel.send(mockingSpongebob(message.content.slice(6)));

            return(null);
          }
          
          message.channel.messages.fetch({ limit: 2 }).then(msg => 
          {
            console.log("last msg " + msg.last().content);
            //console.log("length =",  msg.last().content.length, ", content =", msg.last().content)
            if(msg.last().content.length != 0){
              message.channel.send(mockingSpongebob(msg.last().content.toLowerCase()));
            }
            else{
              message.channel.send("Can't mock message without text")
            }

          });
        }
        
        if(guildCooldown.includes(message.channel.guild.id))
        {
          //console.log("guildcooldown : "+guildCooldown[message.channel.guild.id][0]);
          // Adds the user to the set so that they can't talk for a minute
          talkedRecently[message.channel.guild.id].push(message.author.id);
          setTimeout(() => 
          {
            // Removes the user from the set after a minute
            del = talkedRecently[message.channel.guild.id].indexOf(message.author.id)
            delete talkedRecently[message.channel.guild.id][del];
            //talkedRecently[message.channel.guild.id].delete(message.author.id);
          }, guildCooldown[message.channel.guild.id]*1000);

        }
      }
      
    }
  }
  //------------------------------------------------------------------------------------------------------------
  if(mockList.includes(message.author.id) && skip == 0) 
  {
    if(message.content.length != 0){
      message.channel.send(mockingSpongebob(message.content.toLowerCase()));
    }
    else{
      message.channel.send("Can't mock message without text")
    }
  }

  if (skip == 1) 
  {
    skip = 0;
  }

});

//keepAlive();
bot.login(process.env.token);
console.log("check");

//this is my spaghet, there are many like it, but this spaghet is mine 
