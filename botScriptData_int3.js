'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
  Almost all copy for the bot is pulled from here. Primary exception is for the any of the lines below that have dynamic content being pulled in. Vars were being returned as undefined, so these lines of text are applied directly in botHandler()
*/
// --------------- Script Data -----------------------
let media = {
    wantedanna: 'https://s3.amazonaws.com/mortalengines/hester-wanted.gif',
    wantedattach: '1107544716063862',
    wantedattachlive: '208750936692275',
    mapattach: '1397217713747844',
    mapattachlive: '930085277188831',
    wantedvideo: 'https://s3.amazonaws.com/mortalengines/Me_1.mp4',
    wantedvideoattachlive: '703394763366451',
    wantedvideoattach: '2188708564495752'
  };
  
let phase3 = {
  paths:{
    i3_scene1: {
      image: media.wantedanna,
      imageattached: media.wantedattach,
      intro:'Wanted For Crimes Against London! Have You Seen This Woman? Reply YES Or NO now!',
      // yes:'An agent of London will contact you immediately. Keep Calm & Keep Moving. Thank You.',
      // no:'An agent of London will be in contact with you to provide more information. Keep Calm & Keep Moving.  Thank you.',
      nextStatus:'i3_scene2'
    }, 
    i3_scene1_followup: {
      image: media.wantedanna,
      imageattached: media.wantedattach,
      intro:'Wanted For Crimes Against London! Have You Seen This Woman? Reply YES Or NO now!',
      // yes:'An agent of London will contact you immediately. Keep Calm & Keep Moving. Thank You.',
      // no:'An agent of London will be in contact with you to provide more information. Keep Calm & Keep Moving.  Thank you.',
      nextStatus:'i3_scene2'
    }, 
    i3_scene2: {
      intro:'This is Antonia Critt, (Username), are you receiving?',
      yes:'Great, glad you are still with us.',
      no:'Amusing, glad you are still with us.',
      nextStatus:'i3_scene3',
      exitStatus:'endPrompt1'
    },
    i3_scene3: {
      intro:'That’s Anna Fang. She’s the leader of our resistance against oppression. Some consider her a villain. Do you?',
      yes:'Oh, really?',
      no:'Of course, not. She’s a hero.',
      nextStatus:'i3_scene4'
    },
    i3_scene4: {
      intro:'Predator cities devour the innocent. Swallow their homes, confiscate their belongings, and enslave them. Yet, the Anti-Traction League’s freedom fighters are called criminals. Does that sound fair?',
      yes:'Everyone’s free to an opinion. But, look at this.',
      no:'Exactly. Now, look at this.',
      nextStatus:'i3_scene5'
    },
    i3_scene5: {
      imageattached: media.mapattach,
      intro:'Resources are running out. Those condemned to survive down in the slums vastly outnumber the ruling class above them. A day of reckoning is coming and Thaddeus Valentine knows it.',
      intro2:'That’s why he is hunting Hester and Fang. Understand?',
      yes:'Good. We really need your help. But, this channel is not secure.',
      no:'Please consider what I said. We need your help.',
      nextStatus:'i3_scene6'
    },
    i3_scene6: {
      intro:'I’d better sign off for now. Be safe and ready for anything.',
      nextStatus:'endInteraction2'
    }
  }
  };
  
  var botScriptDataInteractionThree = function(){

    function botScriptDataInteractionThree() {
      _classCallCheck(this, botScriptDataInteractionThree);
    }
    _createClass(botScriptDataInteractionThree, [
       {
        key: 'phase3Script',
        value: function phase3Script() {
          return phase3;
        }
      },
  ]);
  
    return botScriptDataInteractionThree;
  
  }();
  
  exports.default = botScriptDataInteractionThree;
  module.exports = exports['default'];