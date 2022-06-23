//being on the verification page means an email has already been sent to the user after the sign up process
import React, {useState, useEffect} from 'react';
import { View, Text,TouchableOpacity } from 'react-native';
import {StatusBar} from 'expo-status-bar';
import { Ionicons  } from '@expo/vector-icons';
import ResendTimer from '../components/ResendTimer';

// our theme config and other constants
import { COLORS, Constants } from "../constants";

// get status bar height
const StatusBarHeight = Constants.statusBarHeight;

// API client
import axios from '../api/axios';

const Verification = ({route, navigation}) => {
    //get the email the user used to create their account
    const { email } = route.params;

    //this state monitors the state of the resend system
    const [resendingEmail, setResendingEmail] = useState(false);
    //the resend status has the following values: resend, sent, failed
    const [resendStatus, setResendStatus] = useState('Resend');

    //resend timer
    const [timeLeft,setTimeLeft] = useState(null);

    //target time. This is the maximum number of seconds of our timer
    const [targetTime,setTargetTime] = useState(null);

    //active resend will be true whenever the system is ready to allow a resend request
    const [activeResend,setActiveResend] = useState(false);

    //the timer will be triggered at an interval and we use this variable to monitor that
    let resendTimerInterval;

    //handle error messages
    const [message, handleMessage] = useState(null);

    //function to calculate the time left in the timer
    //function accepts a final time parameter. This is a value in milliseconds referring  to when the timer is supposed to end in the future
    const calculateTimeLeft = (finalTime) => { 
        //first we do is to find the difference
        const difference = finalTime - +new Date(); //the + before the new keyword is used to convert the date to a number. It is a shorthand for the syntax 
        if(difference >= 0 ) {
            setTimeLeft(Math.round(difference/1000));
        } else {
            //there is no time to wait
            setTimeLeft(null);
            //clear the current interval
            clearInterval(resendTimerInterval);
            setActiveResend(true);//use to activate the resend button
        }

    }

    //trigger the timer function
    //this triggers the time to work
    const triggerTimer = (targetTimeInSeconds = 30) => { 
        setTargetTime(targetTimeInSeconds);
        //disallow recent request
        setActiveResend(false);
        //calculate our final time
        const finalTime = +new Date() + (targetTimeInSeconds * 1000);

        resendTimerInterval = setInterval(() => {
            calculateTimeLeft(finalTime),1000; //this means our function should be called every second 
    });
    }

    useEffect(() => { 
        triggerTimer();

        //to prevent memory leaks, once the component unmounts, we clear the interval
        return () => { 
            clearInterval(resendTimerInterval);
        }
    }, []);

    //create a resend email async function
    const resendEmail = async () => { 
        //set the resend status to sending
        setResendStatus('Sending');
        //set the resending email to true
        setResendingEmail(true);

        //make an api call to send a new otp to the user
        const config = {
            headers: {
              'Content-Type': 'application/json'
            }
          }
    
          try {
            const response = await axios.post("/api/send_otp", JSON.stringify({ email: email }), config);
        
            const result = response.data;
            const { status, message } = result;
    
            if (status !== 'SUCCESS') {
  
              //set the  message from received from api endpoint
              handleMessage(message);

              //set the resend status to Resend to enable the use to try again just incase the previous attempt did not work
              setResendStatus('Failed');

              //set the resending email to true
              setResendingEmail(false);

              //disable the resend button for 30 seconds again
              triggerTimer();

            } else {
              //Otp email was resent successfully: redirect the user to the otp screen to verify their account
              handleMessage("A new otp was sent successfully.");
            }
          
          } catch (error) {
            handleMessage('An error occurred. Check your network and try again');
            setResendStatus('Resend');
            //set the resending email to false
            setResendingEmail(false);

            //disable the resend button for 30 seconds again
            triggerTimer();
          }
    }

    //take the user to the OTP verification input screen
    const otpInputScreen = () => {
      navigation.navigate('OtpVerificationInput',{
        email: email
      
      });
    }

  return (
    <View style={{flex: 1,alignItems: 'center', padding: 25,paddingTop:StatusBarHeight+ 20,backgroundColor: COLORS.white}}>
      <View style={{flex :1, justifyContent: 'center', padding: 20}}>
        <View style={{width:250, height: 250, backgroundColor: COLORS.lightGreen, borderRadius: 250,justifyContent: 'center', alignItems:'center'}}>
            <StatusBar  style="dark"/>
            <Ionicons name="mail-open-outline" size={125} color={COLORS.brand} />
        </View>
      </View>
          <Text style={{fontSize:20, textAlign:'center',fontWeight:'bold',color:COLORS.brand, padding:10}}>Account Created Successfully</Text>
          <Text style={{color:COLORS.gray, fontSize:15,textAlign:'center'}}>Please verify your account using the OTP sent to 
              <Text style={{fontWeight:'bold', fontStyle:'italic'}}>
                  {` ${email}`}  
              </Text>
           </Text>
           <TouchableOpacity onPress={otpInputScreen} style={{backgroundColor: 'green', flexDirection: 'row', padding:15,backgroundColor:COLORS.brand,justifyContent:'center',alignItems:'center',borderRadius:5, marginVertical:5, height:60}}>
            <Text style={{color:COLORS.white, fontSize:16}}>Proceed </Text>
            <Ionicons name="arrow-forward-circle" size={25} color={COLORS.white} />
           </TouchableOpacity>
           {message && <Text style={{ fontSize: 10, color: 'red' }}>{message}</Text> }
            <ResendTimer 
                activeResend={activeResend}
                resendStatus={resendStatus}
                resendingEmail={resendingEmail}
                timeLeft={timeLeft}
                targetTime={targetTime}
                resendEmail={resendEmail}
            />
  
    </View>
  )
}

export default Verification;