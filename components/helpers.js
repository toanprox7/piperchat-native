import Meteor from 'react-native-meteor';
import update from 'immutability-helper';
import Sound from 'react-native-sound';
import PushNotification from 'react-native-push-notification';
import Permissions from 'react-native-permissions'

const checkSelfFriend = async (path) =>{
  if(path.users.length > 0) {
    const users = path.users;
    const friends = path.buddyList[0].friends;
    const requests = path.buddyList[0].requests;
    const sent = path.buddyList[0].sentRequests;
    const arr = friends.concat(requests, sent);
    const unique = [];
    for(let i = 0; i<users.length; i++) {
      let isUnique = true;
      if (users[i]._id === Meteor.userId()) {
        isUnique = false;
      } else {
        for(let j = 0; j<arr.length; j++) {
          if(users[i]._id === arr[j]) {
            isUnique = false;
            break;
          }
        }
      }
      if(isUnique) unique.push(users[i]);
    }
    return unique;
  }
}

const sortFriendsUnread = async (unread, friends) => {
  for(let i = 0; i<friends.length; i++) {
    for(let j = 0; j<unread.length; j++) {
      if(friends[i]._id === unread[j]) {
        const r = update(friends, {$splice: [[i, 1]]});
        const ns = update(r, {$unshift: [friends[i]]});
        return ns;
      }
    }
  }
}

const getMessages = async (messages, id) => {
  const m = [];
  for(let i = 0; i<messages.length; i++) {
    const mes = messages[i];
    if(mes.from === id || mes.to === id) m.push(mes);
  }
  return m.reverse();
}

const alphabetize = (arr=[]) => {
	return arr.sort((a, b) => {
    if(a.name < b.name) return -1;
    if(a.name > b.name) return 1;
    return 0;
  });
}

function checkIndexOf(arr, obj){
	let exists = false;
	let index = null;
	for(let i = 0; i<arr.length; i++) {
    if(arr[i]._id === obj._id) {
    	exists = true;
    	index = i;
    	break;
    }
  }
  return {bool: exists, pos: index };
}

const loadSound = () => {
  const sound = new Sound('sony_ericsson_tone.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
    if(sound) sound.setVolume(1);
    console.log('duration in seconds: ' + sound.getDuration() + 'number of channels: ' + sound.getNumberOfChannels());
  });
  return sound;
}

const sendNotification = async (message) => {
  Meteor.call('user.get', message.from, (err, res) => {
    if(err) {
      console.log(err);
    } else {
      PushNotification.localNotificationSchedule({
        message: `New message from ${res[0].name}`,
        date: new Date()
      });
    }
  })
}

const requestPermission = async (feature) => {
  Permissions.request(feature).then(res => console.log(res));
}

export { 
  checkSelfFriend,
  sortFriendsUnread, 
  getMessages, 
  alphabetize, 
  checkIndexOf,
  loadSound,
  sendNotification,
  requestPermission,
}