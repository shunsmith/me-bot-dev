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
    wantedhester: 'https://s3.amazonaws.com/mortalengines/hester-wanted.gif',
    wantedanna: 'https://s3.amazonaws.com/mortalengines/anna-wanted.gif',
    hester: 'https://s3.amazonaws.com/mortalengines/interaction2/hester-poster.jpg',
    toaster: 'https://s3.amazonaws.com/mortalengines/interaction2/toaster.jpg',
    cd: 'https://s3.amazonaws.com/mortalengines/interaction2/cd.jpg',
    riddle: 'https://s3.amazonaws.com/mortalengines/interaction2/blueprint-riddle.jpg',
    map: 'https://s3.amazonaws.com/mortalengines/interaction2/lion.jpg',
    keepcalm: 'https://s3.amazonaws.com/mortalengines/interaction2/keepcalm.jpg'
  };
  
let phase2 = {
  paths:{
    i1_scene1: {
      image: media.wantedhester,
      intro:'Wanted For Crimes Against London. Have you Seen This Woman?  Reply Now ‘YES’ Or ‘NO’',
      yes:'An agent of London will contact you immediately. Stay Calm & Keep Moving. Thank You.',
      no:'If you have any information regarding her identity or whereabouts please inform Guildhall immediately. Stay Calm & Keep Moving. Thank you.',
      nextStatus:'i1_scene2'
    }, 
    i1_scene1_followup: {
      image: media.wantedhester,
      intro:'Wanted For Crimes Against London. Have you Seen This Woman?  Reply Now ‘YES’ Or ‘NO’',
      yes:'An agent of London will contact you immediately. Stay Calm & Keep Moving. Thank You.',
      no:'If you have any information regarding her identity or whereabouts please inform Guildhall immediately. Stay Calm & Keep Moving. Thank you.',
      nextStatus:'i1_scene2'
    }, 
    i1_scene2: {
      intro:'WARNING. UNDECTED SIGNALLL. STAND BYS.SSJOPIELK; LSSSS€8zwmmmaa°√¬åS8ñññØÍ8‘˙È§∫ÆV´m~qˆïK€‹∏q£3777===;;ãù∂S◊N•RÍ∫¿†Å',
      intro2:'This is Antonia Critt, are you receiving?',
      yes:'Good. I’ve hacked the city’s feed. The tech is ancient and prone to malfunction.',
      no:'Please bear with me. This ancient tech I’ve hijacked can be very unreliable.',
      nextStatus:'i1_scene3',
      exitStatus:'endPrompt1'
    },
    i1_scene3: {
      intro:'Are you, (Username)?',
      yes:'Perfect, I have important information for you.',
      no:'I have important information, whomever you are.',
      nextStatus:'i1_scene4'
    },
    i1_scene4: {
      intro:'The masked woman’s name is Hester Shaw. She was ingested by London while on Salzhaken. She’s no criminal. She’s a victim. Her mother was murdered by Thaddeus Valentine.  Do you believe me?',
      yes:'Then help me find her before the corrupt government agents do. Keep your eyes and ears open. I’ll be in touch again soon.',
      no:'Trust me, you will. But, not if the corrupt government agents find her before we do. Please stay alert. I’ll be back in touch soon.',
      nextStatus:'endInteraction1'
    }
  }
  };
  
  var botScriptDataInteractionTwo = function(){

    function botScriptDataInteractionTwo() {
      _classCallCheck(this, botScriptDataInteractionTwo);
    }
    _createClass(botScriptDataInteractionTwo, [
       {
        key: 'phase2Script',
        value: function phase2Script() {
          return phase2;
        }
      },
  ]);
  
    return botScriptDataInteractionTwo;
  
  }();
  
  exports.default = botScriptDataInteractionTwo;
  module.exports = exports['default'];