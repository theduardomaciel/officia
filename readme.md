#  Additional Steps

## Android
1. ~~Enable Hermes through `android/gradle.properties`:~~
~~> hermesEnabled=true~~

2. Update Kotlin version, through `android/build.gradle`, to the following version (or newer) for WatermelonDB compatibility:

    ```gradle
    kotlinVersion = '1.8.10'
    ```

3. Add permission to PDF files reading, through `android/app/src/main/AndroidManifest.xml`:
    ```xml
    <code>
        ...
    </application>
    <queries>
    <intent>
        <action android:name="android.intent.action.VIEW" />
        <!-- To allow any MIME type, set "mimeType" to
         "*/*". -->
        <data android:mimeType="application/pdf" />
    </intent>
    </queries>
    </manifest>
    </code>
    ```

4. Check if these permissions have been added:

    ```xml
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
    <uses-permission android:name="android.permission.VIBRATE"/>
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO"/>
    ```


### Customization

* Translucent navigation bar

1. Update xml styles through `android/app/src/main/res/values/styles.xml`, for:

    > Translucent navigation bar
    ```xml
        <resources>
        <!-- Base application theme. -->
        <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
            <!-- Make status & navigation bar translucent -->
            <item name="android:navigationBarColor">@android:color/transparent</item>
            <item name="android:windowTranslucentNavigation">true</item>
            <item name="android:windowTranslucentStatus">true</item>
            <item name="android:enforceNavigationBarContrast">false</item>
        </style>
    </resources>
    ```

    > Date picker customization
    ```xml
        <style name="DatePickerTheme" parent="DatePickerBaseTheme">
            <item name="android:colorControlNormal">#6CBE45</item>
            <item name="colorAccent">#6CBE45</item>
            <item name="android:textSize">28sp</item>
        </style>
    ```