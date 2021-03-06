import React, { PureComponent } from 'react';
import {
	Animated,
	View,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Keyboard,
	Text,
	TextInput,
	StyleSheet,
	KeyboardAvoidingView,
	Image,
	FlatList
} from 'react-native';
import ChatBubble from './ChatBubble';
import Meteor from 'react-native-meteor';
import { getMessages } from '../helpers';

export default class Chat extends PureComponent {
  constructor(props) {
  	super(props);
  	this.state = {
  		visible: [],
  		isHidden: false,
  		chat: new Animated.Value(0),
  		hideChat: new Animated.Value(this.props.height - 60),
  		inputText: ''
  	}
  	this.styles = StyleSheet.create({
  		dismissContainer: {
				height: '100%',
				width: '100%',
				justifyContent: 'center',
				alignItems: 'center'
			},
			center: {
				height: '100%',
				width: '100%',
				justifyContent: 'flex-start',
				alignItems: 'center',
			},
			header: {
				backgroundColor: '#139A8F',
				height: 50,
				width: '100%',
				justifyContent: 'space-between',
				alignItems: 'center',
				flexDirection: 'row',
				shadowColor: '#000',
        shadowOffset:{  width: 0,  height: 5,  },
        shadowColor: 'black',
        shadowOpacity: 0.3,
        zIndex: 2
			},
			headerButtonLeft: {
				height: 50,
				width: 50,
				borderRadius: 50/2,
				justifyContent: 'center',
				alignItems: 'center'
			},
			headerButtonRight: {
				height: 50,
				width: 50,
				borderRadius: 50/2,
				justifyContent: 'center',
				alignItems: 'center'
			},
			input: {
				height: 50,
				flex: 1,
				backgroundColor: '#EFF4F4',
				paddingRight: 10,
				paddingLeft: 10,
				paddingTop: 5,
				paddingBottom: 5,
				fontSize: 16,
				borderRadius: 50/2,
				marginRight: 2.5,
				marginLeft: 2.5,
				shadowColor: '#000',
        shadowOffset:{ width: 0,  height: -3 },
        shadowColor: 'black',
        shadowOpacity: 0.2,
			},
			send: {
				height: 50,
				width: 50,
				borderRadius: 50/2,
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#16B0A5',
				marginLeft: 2.5,
				marginRight: 2.5,
				shadowColor: '#000',
        shadowOffset:{ width: 0,  height: -3 },
        shadowColor: 'black',
        shadowOpacity: 0.2,
			}
  	});
  }

  componentDidMount = () => {
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
    setTimeout(() => {
    	Animated.spring(this.state.hideChat, {toValue: 0, useNativeDriver: true }).start();
    	this.setState({isHidded: false});
    }, 200);
    getMessages(this.props.messages, this.props.id)
    	.then(m => this.setState({ visible: m }));
  }

  componentWillUnmount = () => {
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }

  componentWillReceiveProps = (nextProps) => {
  	if(nextProps.id !== null && nextProps.id !== undefined && nextProps.messages.length > 0) {
  		getMessages(nextProps.messages, nextProps.id)	
  			.then(m => this.setState({ visible: m }));
  	}	
  	if(this.props.openChats.length < nextProps.openChats.length && this.state.hideChat._value === this.props.height - 110) {
  		this.toggleChat();
  	}
  	if(nextProps.connectingActive) {
  		Animated.spring(this.state.hideChat, {toValue: this.props.height - 110, useNativeDriver: true }).start();
  		this.setState({ isHidden: true });	
  	}
  }

  scrollToBottom = (bool=true) => {
  	if(this.flatList) this.flatList.scrollToOffset(0, {animated: bool});
  }

  keyboardWillShow = async (event) => {
    Animated.timing(this.state.chat, { duration: event.duration, toValue: 1 }).start();
  }

  keyboardWillHide = async (event) => {
    Animated.timing(this.state.chat, { duration: event.duration, toValue: 0 }).start();
  }

  closeChat = () => {
  	this.props.closeChat();
  	if(this.props.openChats.length === 0) {
  		Animated.spring(this.state.hideChat, {toValue: this.props.height - 60, useNativeDriver: true }).start();
    	this.setState({ isHidded: false });
  	}
  }

  toggleChat = () => {
  	if(this.state.isHidden) {
  		Animated.spring(this.state.hideChat, {toValue: 0, useNativeDriver: true }).start();
  		this.setState({isHidden: false});
  	} else {
  		Animated.spring(this.state.hideChat, {toValue: this.props.height - 110, useNativeDriver: true }).start();
  		this.setState({isHidden: true});
  	}
  	Keyboard.dismiss();
  }

  headerPressed = () => {
  	if(this.state.isHidden) {
  		Animated.spring(this.state.hideChat, {toValue: 0, useNativeDriver: true }).start();
  		this.setState({isHidden: false});
  	}
  }

  sendMessage = () => {
  	const { inputText } = this.state;
  	const text = inputText.trim();
  	if(text !== '') {
  		Meteor.call('message.send', this.props.id, text, (error, result) => {
	      if(error) {
	        console.log(error);
	      } else {
	        this.setState({ inputText: '' });
	        Meteor.call('user.addNew', this.props.id, (err, res) => {
	        	if(err) console.log(err);
	        });
	      }
	    });
  	}
  }

  checkUnread = () => {
  	if(this.props.unread.indexOf(this.props.id) !== -1) {
  		Meteor.call('user.removeNew', this.props.id, (err, res) => {
        if(err) console.log(err);
      });
  	}
  }

  render = () => {
    return (
    	<Animated.View
    		style={{
	  			position: 'absolute',
	  			top: 60,
	  			left: 0,
	  			height: this.props.height -60,
	  			width: '100%',
	  			backgroundColor: '#fff',
	  			zIndex: 80,
	  			justifyContent: 'center',
	  			alignItems: 'center',
	  			transform: [
	  				{ translateY: this.state.hideChat }
	  			]
	  		}}>
    		<KeyboardAvoidingView
    			behavior="padding"
    			resetScrollToCoords={{ x: 0, y: 0 }}
    			style={this.styles.dismissContainer}>
    			<View
    				style={this.styles.center}>
    				<TouchableWithoutFeedback 
    					style={this.styles.header}
    					onPress={this.headerPressed}>
    					<View style={this.styles.header}>
    						<TouchableOpacity
	    						onPress={this.closeChat}
	    						style={this.styles.headerButtonLeft}>
	    						<Image 
	    							style={{
	    								height: 17.5,
	    								width: 17.5,
	    							}}
	    							source={require('../../public/close1.png')} />
	    					</TouchableOpacity>
	    					<Text
	    						style={{
	    							color: '#fff',
	    							fontSize: 18,
	    							fontWeight: '200'
	    						}}>{this.props.name}</Text>
	    					<TouchableOpacity
	    						onPress={this.toggleChat}
	    						style={this.styles.headerButtonRight}>
	    						<Image 
	    							style={{
	    								height: 22.5,
	    								width: 22.5,
	    							}}
	    							source={this.state.isHidden ? require('../../public/up.png') : require('../../public/down-arrow.png')} />
	    					</TouchableOpacity>
    					</View>
    				</TouchableWithoutFeedback>
    				<Animated.View
    					style={{
								flex: 1,
								height: this.state.chat.interpolate({
		        			inputRange: [0, 1],
		        			outputRange: [this.props.height - 165, this.props.height - 215]
		        		}),
								width: '100%',
								transform: [
				        	{translateY: this.state.chat.interpolate({
				        			inputRange: [0, 1],
				        			outputRange: [this.props.inCall ? -20 : 0, this.props.inCall ? -80 : -60]
				        		})
				        	}
				        ]
							}}>
    					<FlatList
    						inverted
    						ref={(r) => { this.flatList = r; }}
	    					style={{
									flex: 1,
									height: '100%',
									width: '100%',
									backgroundColor: '#fff',
									transform: [{ scaleY: -1 }]
								}}
								onScroll={this.checkUnread}
								scrollEventThrottle={1000}
	    					data={this.state.visible}
	    					keyboardDismissMode="on-drag"
	    					keyboardShouldPersistTaps="never"
	    					renderItem={({item, index}) => 
	    						<ChatBubble 
							  		text={item.text}
							  		from={item.from} />
						 			}
						  	keyExtractor={(item, index) => index}
						  	removeClippedSubviews={true} />
    				</Animated.View>
						<Animated.View 
							style={{
								width: '100%',
								height: 50,
								justifyContent: 'center',
								alignItems: 'center',
								flexDirection: 'row',
								backgroundColor: '#fff',
				        marginTop: 5,
				        transform: [
				        	{translateY: this.state.chat.interpolate({
				        			inputRange: [0, 1],
				        			outputRange: [this.props.inCall ? -20 : 0, this.props.inCall ? -80 : -60]
				        		})
				        	}
				        ]
							}}>
							<TextInput 
								ref={(r) => { this.messager = r; }}
								style={this.styles.input}
								placeholder="Message" 
								multiline={true}
								onFocus={this.checkUnread}
								onChangeText={(text) => this.setState({inputText: text})}
								value={this.state.inputText} />
							<TouchableOpacity
								onPress={this.sendMessage}
								style={this.styles.send}>
									<Image 
										style={{ height: 22.5, width: 22.5 }}
										source={require('../../public/sent.png')} />
								</TouchableOpacity>
						</Animated.View>	
    			</View>
    		</KeyboardAvoidingView>
    	</Animated.View>
    );
  }
}
