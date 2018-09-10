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
    toaster: 'https://s3.amazonaws.com/mortalengines/2488_TP2_00126R.jpg',
    cd: 'https://s3.amazonaws.com/mortalengines/2488_TP2_00126R.jpg',
    riddle: 'https://s3.amazonaws.com/mortalengines/2488_TP2_00126R.jpg',
    map: 'https://s3.amazonaws.com/mortalengines/blueprint7.jpg',
  };
  
let phase2 = {
  scene1: {
    intro:'Hello, (Username). Your time on London has been productive.\nI’ve spoken to my supervisor Dr. Pomeroy about  getting you an apprenticeship in the Guild of Historians. Isn’t that exciting?',
    yes:'Excellent.',
    no:'Nerves of steel. You’ll need them.',
    nextStatus:'scene2'
  }, 
  scene2: {
    intro:'Before you can earn first badge in the Historians’ Guild, there are a few tests I must administer to verify your qualifications.',
    intro2:'A good historian is able to quickly identify Ancient Tech.',
    question:'Are you ready?',
    yes:'Good. Let’s begin',
    no:'Contact me when you’re ready.',
    nextStatus:'scene3',
    exitStatus:'endPrompt1'
  },
  scene3: {
    intro: 'You joined this city when your traction town was devoured by London. These artifacts were recovered from your former home.',
    question:'Is this old tech known as a Cassette, or a Seedie?',
    cassetteResponses: [
      'cassette',
      'cassette tape',
      'tape',
    ],
    cdResponses: [
      'seedie',
      'cd',
      'compact disc',
      'disc'
    ],
    btnOptions: [
      {
        title: 'Cassette',
        payload: 'cassette'
      },
      {
        title: 'Seedie',
        payload: 'seedie'
      }
    ],
    image: media.cd,
    yes: 'Well done!', // CD response
    no: 'We have found numerous of these “seedies” over the years. They seem to have been prolific in the time of the Ancients.',
    nextStatus:'scene4'
  },
  scene4: {
    question:'Here is the second artifact. Would you keep it, or discard it?',
    btnOptions: [
      {
        title: 'Keep',
        payload: 'keep'
      },
      {
        title: 'Discard',
        payload: 'discard'
      }
    ],
    image: media.toaster,
    yes: 'Excellent. This is known as a “toaster” and was commonly used to heat a food called “bread”.', // Keep response
    yes2:'This would be a most prized addition to our collection.',
    no: 'Oh no. You’ve failed to ascertain that this as an excellent example of ancient tech that would make a fine addition to our Museum.',
    nextStatus:'assessMore'
  },
  assessMore: {
    question:'Would you like to assess more items?',
    yesStatus:'showItems',
    nextStatus:'scene5'
  },
  showItems: {

  },
  scene5: {
    intro:'One more test. There is a riddle known to all Historians. You must answer it if you want to join the Guild.',
    question:'_“King of beasts, London shakes when I speak. From St. Pauls above, all hear my roar; Right down to the Gut beneath my claws.”_\nWhat am I?',
    followup1:'Type in the answer when you solve it.',
    hint1:'Need a hint, eh. The answer is an animal historically associated with old London.',
    hint2:'Need another hint?',
    image: media.riddle,
    image2: media.map,
    
  },
  endPrompt1: {
    response:'You’re ready now. Good, let’s begin.',
    nextStatus:'scene3'
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