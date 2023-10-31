package com.theduardomaciel.officia;

import android.app.Application;
import android.content.res.Configuration;
import androidx.annotation.NonNull;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;

import java.util.Arrays; // ⬅️ This!
import com.facebook.react.bridge.JSIModuleSpec; // ⬅️ This!
import com.facebook.react.bridge.JSIModulePackage; // ⬅️ This!
import com.facebook.react.bridge.ReactApplicationContext; // ⬅️ This!
import com.facebook.react.bridge.JavaScriptContextHolder; // ⬅️ This!
import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage; // ⬅️ This!

import expo.modules.ApplicationLifecycleDispatcher;
import expo.modules.ReactNativeHostWrapper;

import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
    new ReactNativeHostWrapper(this, new DefaultReactNativeHost(this) {
      @Override
      public boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
      }

      @Override
      protected List<ReactPackage> getPackages() {
        @SuppressWarnings("UnnecessaryLocalVariable")
        List<ReactPackage> packages = new PackageList(this).getPackages();
        // Packages that cannot be autolinked yet can be added manually here, for example:
        // packages.add(new MyReactNativePackage());
        return packages;
      }

      @Override
      protected String getJSMainModuleName() {
        return "index";
      }

      @Override
      protected boolean isNewArchEnabled() {
        return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
      }

      @Override
      protected Boolean isHermesEnabled() {
        return BuildConfig.IS_HERMES_ENABLED;
      }

      @Override
      protected JSIModulePackage getJSIModulePackage() {
        return new JSIModulePackage() {
          @Override
          public List<JSIModuleSpec> getJSIModules(
            final ReactApplicationContext reactApplicationContext,
            final JavaScriptContextHolder jsContext
          ) {
            List<JSIModuleSpec> modules = Arrays.asList();

            modules.addAll(new WatermelonDBJSIPackage().getJSIModules(reactApplicationContext, jsContext)); // ⬅️ This!
            // ⬅️ add more JSI packages here by conventions above, for example:
            // modules.addAll(new ReanimatedJSIModulePackage().getJSIModules(reactApplicationContext, jsContext));

            return modules;
          }
        };
      }
  });

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
    }
    ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
    ApplicationLifecycleDispatcher.onApplicationCreate(this);
  }

  @Override
  public void onConfigurationChanged(@NonNull Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig);
  }
}
