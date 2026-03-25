package com.linguahub.ankidroid

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "AnkiDroid")
class AnkiDroidPlugin : Plugin() {

    @PluginMethod
    fun checkPermission(call: PluginCall) {
        // TODO: check AnkiDroid ContentProvider permission
        val ret = com.getcapacitor.JSObject()
        ret.put("granted", false)
        call.resolve(ret)
    }

    @PluginMethod
    fun requestPermission(call: PluginCall) {
        // TODO: request AnkiDroid ContentProvider permission
        val ret = com.getcapacitor.JSObject()
        ret.put("granted", false)
        call.resolve(ret)
    }

    @PluginMethod
    fun getCards(call: PluginCall) {
        // TODO: query AnkiDroid ContentProvider
        val ret = com.getcapacitor.JSObject()
        ret.put("cards", com.getcapacitor.JSArray())
        call.resolve(ret)
    }

    @PluginMethod
    fun addCard(call: PluginCall) {
        // TODO: insert card via AnkiDroid ContentProvider
        call.unimplemented("addCard not yet implemented")
    }
}
