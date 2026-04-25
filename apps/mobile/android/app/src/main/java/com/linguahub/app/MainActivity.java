package com.linguahub.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.linguahub.ankidroid.AnkiDroidPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AnkiDroidPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
