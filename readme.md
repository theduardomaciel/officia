## Additional steps

On "android/gradle.properties" it's necessary to enable hermes:
> hermesEnabled=true

On "android/build.gradle" it's necessary to update Kotlin version to a newer version, like this: 
> kotlinVersion = '1.8.10'

On "android/app/src/main/AndroidManifest.xml" it's necessary to add permission to PDF files reading:

<code>
    ...
  </application>
+ <queries>
+   <intent>
+     <action android:name="android.intent.action.VIEW" />
+     <!-- If you don't know the MIME type in advance, set "mimeType" to "*/*". -->
+     <data android:mimeType="application/pdf" />
+   </intent>
+ </queries>
</manifest>
</code>

It's also necessary to check if these permissions have been added:

<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>