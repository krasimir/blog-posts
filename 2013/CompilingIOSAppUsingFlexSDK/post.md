As you may know, Apple doesn't allow creation of iOS applications just like that. Especially under Windows. It's somehow a complex process, which requires several steps in a specific order. However it is still possible and you can do that without Mac.[STOP]

## Introduction
The main task is to use Flex SDK to develop an interactive iOS application. In other words - to convert *.swf* file to installable *.ipa* file. You can download the SDK from [here](http://www.adobe.com/devnet/flex/flex-sdk-download.html). What you need is the AIR Developer Tool (ADT). It's located in *bin* directory of the sdk. I suggest you to include it in your global *Path*, so you can invoke the *adt* command everywhere (check step 1 for more information regarding the global *Path*). The [official documentation](http://help.adobe.com/en_US/air/build/WSfffb011ac560372f3cb56e2a12cc36970aa-8000.html) says that we should use the following command:

	adt -package -target ipa-debug -keystore iosPrivateKey.p12 -storetype pkcs12 -storepass qwerty12 -provisioning-profile ios.mobileprovision HelloWorld.ipa HelloWorld-app.xml HelloWorld.swf icons Default.png

It's a little bit difficult to read, but here are the files which we need:
  1. valid *.p12* certificate file
  2. mobile provision file (.mobileprovision)
  3. application descriptor (.xml)
  4. of course, .swf file

The application description (3) could be easily created with every editor (like notepad for example). It is clear the we have the *.swf* file, so the big issue is finding the *.p12* certificate and the mobile provision file.

## Step 1: generate certificate signing request file
To generate the *.p12* file we need a valid developer certificate from the Apple's system. We can get one from *developer.apple.com*, but before to go there we need a certificate signing request file. To create it, use SSL for windows. Download it from [here](http://gnuwin32.sourceforge.net/packages/openssl.htm). After successful installation you should be able to run the following command in your windows's prompt.

	openssl -help

If you receive

	'openssl' is not recognized as an internal or external command, operable program or batch file.

then you should add the openssl.exe in your PATH variable. Run the following command:

	sysdm.cpl

In the opened window choose *Environment Variables...* button under the *Advanced* tab.

![Environment Variables](http://krasimirtsonev.com/blog/articles/CompilingIOSAppUsingFlexSDK/files/PATH.jpg)

Find *Path* in *System variables* section, click Edit button and add the path to openssl.exe. 

![Environment Variables](http://krasimirtsonev.com/blog/articles/CompilingIOSAppUsingFlexSDK/files/PATH2.jpg)

In my case this is 

	C:\Program Files (x86)\GnuWin32\bin\

Once you have the openssl.exe accessible from everywhere you can generate a *.key* file:

	openssl genrsa -out developer.key 2048

Create the *.certSigningRequest* file:

	openssl req -new -key developer.key -out CertificateSigningRequest.certSigningRequest  -subj "/emailAddress=youremail@site.com, CN=Firstname Lastname, C=EN

If you receive 
	
	Unable to load config info from /usr/local/ssl/openssl.cnf

then run the following command and try again (have in mind that the path to openssl.cnf could be different on your computer)

	set OPENSSL_CONF=C:\Program Files (x86)\GnuWin32\share\openssl.cnf

## Step 2: generate certificate
The whole process requires a developer account in Apple's system. Unfortunately it's not free and the cost at the moment is 99$ per year. If you don't have such account you can go [here](https://developer.apple.com/programs/ios/) and make an order.

Open [https://developer.apple.com/](https://developer.apple.com/) and click on *Member Center* at the header. After successful login you should see the following screen:

![developer.apple.com](http://krasimirtsonev.com/blog/articles/CompilingIOSAppUsingFlexSDK/files/developer1.jpg)

Click on *iOS Provisioning Portal* and after that on *Certificates* (it's in the left sidebar menu). In the new page choose *Request Certificate*.

![developer.apple.com](http://krasimirtsonev.com/blog/articles/CompilingIOSAppUsingFlexSDK/files/developer2.jpg)

Here is the place where you should use the generated *.certSigningRequest* file. Choose the option 3 and attach your file.

![developer.apple.com](http://krasimirtsonev.com/blog/articles/CompilingIOSAppUsingFlexSDK/files/developer3.jpg)

For awhile your certificate will be flagged with status *Pending Issuance*. Refresh the page few times and you will be able to download it.

![developer.apple.com](http://krasimirtsonev.com/blog/articles/CompilingIOSAppUsingFlexSDK/files/developer4.jpg)

## Step 3: register your device
It's an interesting fact that your application will not run on any device. Even if it is compiled successfully iTunes will not be able to install it if your device is not added into *developer.apple.com*. So, again go to [https://developer.apple.com/](https://developer.apple.com/) -> Member Center. From the right menu choose *Devices* and select *Add Devices* button.

![developer.apple.com](http://krasimirtsonev.com/blog/articles/CompilingIOSAppUsingFlexSDK/files/developer5.jpg)

Put whatever you want in *Device Name*, but you should get the right *Device ID*.

![developer.apple.com](http://krasimirtsonev.com/blog/articles/CompilingIOSAppUsingFlexSDK/files/developer6.jpg)

I think that the easier way to do this is to launch iTunes and get it from there.

![developer.apple.com](http://krasimirtsonev.com/blog/articles/CompilingIOSAppUsingFlexSDK/files/deviceid.jpg)

In some cases you will see *Serial number* instead of *Identifier*. Just click on it and it will change.

## Step 4: create an ID for your app
Go to [https://developer.apple.com/](https://developer.apple.com/) -> Member Center -> App IDs. Click on *New App ID* and fill the form. Add some description and type * (asterisk) for *Bundle Identifier*. There is no need to choose *Bundle Seed ID*.

![developer.apple.com](http://krasimirtsonev.com/blog/articles/CompilingIOSAppUsingFlexSDK/files/appid.jpg)

## Step 5: get a *mobileprovision* profile
Go to [https://developer.apple.com/](https://developer.apple.com/) -> Member Center -> Provisioning. There is a button *New Profile*. Click it and fill the following form:

![developer.apple.com](http://krasimirtsonev.com/blog/articles/CompilingIOSAppUsingFlexSDK/files/mobileprovision.jpg)

Of course, select the correct *App ID* and *Devices*. Once the form is submitted you will be able to download the *.mobileprovision* file.

![developer.apple.com](http://krasimirtsonev.com/blog/articles/CompilingIOSAppUsingFlexSDK/files/mobileprovision2.jpg)

## Step 6: convert the Apple's certificate into a PEM certificate file

	openssl x509 -in ios_development.cer -inform DER -out ios_development.pem -outform PEM

## Step 7: generate a valid P12 file

	openssl pkcs12 -export -inkey developer.key -in ios_development.pem -out developer.p12

You will be asked for a password. Type something and remember it. You will need it later.

## Step 8: create application descriptor file
It's a simple xml file with the following structure:

	<?xml version="1.0" encoding="UTF-8"?> 
	<application xmlns="http://ns.adobe.com/air/application/2.7"> 
	    <id>Application</id> 
	    <versionNumber>0.1</versionNumber> 
	    <filename>Application</filename> 
	    <initialWindow> 
			<autoOrients>true</autoOrients>
			<aspectRatio>landscape</aspectRatio>
	        <content>Your.swf</content>
	        <visible>true</visible> 
	        <width>1280</width> 
	        <height>720</height>
			<fullScreen>true</fullScreen>
			<renderMode>gpu</renderMode>
	    </initialWindow>
		<iPhone>
	        <InfoAdditions>
	            <![CDATA[
	               <key>UIDeviceFamily</key>
	               <array>
	                   <string>2</string>
	               </array>
	           ]]>
	        </InfoAdditions>
	    </iPhone>
	</application>

There are few interesting things. Pay attention to the tags in &lt;initialWindow>. I'm referring *autoOrients* and *aspectRatio*. These options will define the behaviour of your application regarding the device's orientation. The other very important thing is in *iPhone* tag. *UIDeviceFamily* should have &lt;string>1&lt;/string> if you target your application for iPhone and &lt;string>2&lt;/string> if you plan to install it on iPad. If you miss this your app will not scale correctly.

## Step 8: Use AIR Developer Tool (ADT) to generate installable iOS application (*.ipa* file)
And at the end, you should collect everything in a single command and execute it:

	adt -package -target ipa-debug -keystore developer.p12 -storetype pkcs12 -storepass password -provisioning-profile profile.mobileprovision app.ipa appdescriptor.xml yourswf.swf

Have in mind that you should replace *password* with your real password set in step 7.

## Step 9: Installing the *.ipa* file
It's really simple - just double click on it. iTunes will run and you should be able to open your device's profile. There should be an *Apps* tab. Check you application and sync the device. If The installation fail check if you correctly choose the device in step 5.

## Resources
- [Creating your first AIR application for iOS](http://help.adobe.com/en_US/air/build/WSfffb011ac560372f3cb56e2a12cc36970aa-8000.html)
- [Converting a developer certificate into a P12 file](http://help.adobe.com/en_US/as3/iphone/WS144092a96ffef7cc-371badff126abc17b1f-7fff.html)
- [Developing iOS Applications on Windows (video)](http://gotoandlearn.com/play.php?id=133)
- [Creation of an iPhone App with Flash and without a Mac](http://www.emanueleferonato.com/2011/09/22/creation-of-an-iphone-app-with-flash-and-without-a-mac-for-all-windows-lovers/)
- [The application descriptor file structure](http://help.adobe.com/en_US/air/build/WS5b3ccc516d4fbf351e63e3d118666ade46-7f84.html)