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
    fang: 'https://s3.amazonaws.com/mortalengines/interaction2/hester-poster.jpg',
    toaster: 'https://s3.amazonaws.com/mortalengines/interaction2/toaster.jpg',
    cd: 'https://s3.amazonaws.com/mortalengines/interaction2/cd.jpg',
    riddle: 'https://s3.amazonaws.com/mortalengines/interaction2/blueprint-riddle.jpg',
    map: 'https://s3.amazonaws.com/mortalengines/interaction2/lion.jpg',
    keepcalm: 'https://s3.amazonaws.com/mortalengines/interaction2/keepcalm.jpg'
  };
  
let phase3 = {
  paths:{
    i3_scene1: {
      intro:'May we have a candid conversation, (Username)?',
      yes:'I knew you would be open to hearing what I have to say.',
      no:'Oi. All business, eh. You’ll do well to listen anyway.',
      nextStatus:'i3_scene2'
    }, 
    // i3_scene1_followup: {
    //   intro:'Hello, (Username). Your time on London has been productive. I’ve spoken to my supervisor Dr. Pomeroy about getting you an apprenticeship in the Guild of Historians. Isn’t that exciting?',
    //   yes:'Excellent.',
    //   no:'Nerves of steel. You’ll need them.',
    //   nextStatus:'i3_scene2'
    // }, 
    i3_scene2: {
      intro:'Your performance thus far has been impressive. London is where the most adaptable prosper.',
      intro2:'It is no small feat you were able to escape the brutal conditions of the lower tiers.',
      nextStatus:'i3_scene3',
    },
    i3_scene3: {
      image:media.fang,
      intro: 'This is the legendary outlaw Anna Fang.',
      question:'Have you heard of her?',
      yes:'So you know how dangerous she is.',
      no:'She’s the most dangerous person in the outlands.',
      nextStatus:'i3_scene4'
    },
    i3_scene4: {
      intro:'Branded a terrorist by London, she operates in the shadows, working to halt all predator cities, especially ours.',
      question:'Here is the second artifact. Would you keep it, or discard it?',
      image: media.map,
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
      keepResponses: [
        'keep',
        'keep it'
      ],
      discardResponses: [
        'discard',
        'discard it',
        'throw it away',
        'toss it'
      ],
      yes: 'Excellent. This is known as a “toaster” and was commonly used to heat a food called “bread”.', // Keep response
      yes2:'This would be a most prized addition to our collection.',
      no: 'Oh no. You’ve failed to ascertain that this as an excellent example of ancient tech that would make a fine addition to our Museum. But, you have another chance to redeem yourself.',
      nextStatus:'i3_scene5'
    },
    i3_scene5: {
      intro:'One more test. There is a riddle known to all Historians. You must answer it if you want to join the Guild.',
      question:'_“King of beasts, London shakes when I speak. From St. Pauls above, all hear my roar; Right down to the Gut beneath my claws.”_\nWhat am I?',
      followup1:'Type in the answer when you solve it.',
      wrong: 'Not quite.',
      correctResponses:['lion','lions','a lion'],
      image: media.riddle,
      nextStatus: 'answerFinalYes',
      hintStatus:'i3_mapHint'
    },
    i3_mapHint: {
      image: media.map,
      hint1:'This “king of beasts” is historically associated with old London.',
      hint2:'Need another hint?',
      question:'Inspect the bow of London. What animal do you see?',
      nextStatus: 'answerFinalYes',
      noStatus: 'answerFinalNo'
    },
    answerFinalYes: {
      response:'That’s it! Very impressive.\nYou’ll be a true asset to London and the historians.',
      response2:'Here is your Identification Badge for Apprentice Historian, Third Class.',
      response3:'You’ll need it to move about London.',
      nextStatus: 'i3_scene6'
    },
    answerFinalNo: {
      response:'Oh, well. I suppose we can start you out as an Apprentice, Third Class.',
      response2:'Here is your Identification Badge.',
      response3:'You’ll need it to move about London.',
      nextStatus: 'i3_scene6'
    },
    i3_scene6: {
      intro:'As you are now part of the Historians, there is something I want you to do for me.',
      intro2:'Keep an eye out for this masked woman.',
      image:media.hester,
      intro3:'She’s infiltrated the City of London. Thaddeus Valentine, the head of our Guild, wants to know her whereabouts.',
      intro4:'Meanwhile, congratulations on your appointment, (Username)! And, goodbye for now.',
      nextStatus:'i3_endInteraction2'
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