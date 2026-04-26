package com.linguahub.ankidroid

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import androidx.core.content.ContextCompat
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import org.json.JSONArray
import org.json.JSONObject

private const val ANKIDROID_PACKAGE = "com.ichi2.anki"
private const val ANKIDROID_PERMISSION = "com.ichi2.anki.permission.READ_WRITE_DATABASE"
private const val AUTHORITY = "com.ichi2.anki.flashcards"

// Field separator used by AnkiDroid in the flds column
private const val FIELD_SEPARATOR = "\u001f"

// Default page size for paginated queries
private const val DEFAULT_LIMIT = 500

private val NOTES_URI: Uri = Uri.parse("content://$AUTHORITY/notes")
private val MODELS_URI: Uri = Uri.parse("content://$AUTHORITY/models")
private val DECKS_URI: Uri = Uri.parse("content://$AUTHORITY/decks")

@CapacitorPlugin(
    name = "AnkiDroid",
    permissions = [
        Permission(
            strings = [ANKIDROID_PERMISSION],
            alias = "ankidroid",
        ),
    ],
)
class AnkiDroidPlugin : Plugin() {

    // -------------------------------------------------------------------------
    // Permissions
    // -------------------------------------------------------------------------

    @PluginMethod
    fun checkPermission(call: PluginCall) {
        val result = JSObject()
        result.put("ankiDroidInstalled", isAnkiDroidInstalled())
        result.put("granted", hasAnkiDroidPermission())
        call.resolve(result)
    }

    @PluginMethod
    fun requestPermission(call: PluginCall) {
        if (!isAnkiDroidInstalled()) {
            val result = JSObject()
            result.put("ankiDroidInstalled", false)
            result.put("granted", false)
            call.resolve(result)
            return
        }
        if (hasAnkiDroidPermission()) {
            val result = JSObject()
            result.put("ankiDroidInstalled", true)
            result.put("granted", true)
            call.resolve(result)
            return
        }
        requestPermissionForAlias("ankidroid", call, "onAnkiDroidPermissionResult")
    }

    @PermissionCallback
    private fun onAnkiDroidPermissionResult(call: PluginCall) {
        val result = JSObject()
        result.put("ankiDroidInstalled", isAnkiDroidInstalled())
        result.put("granted", hasAnkiDroidPermission())
        call.resolve(result)
    }

    // -------------------------------------------------------------------------
    // Schema discovery
    // -------------------------------------------------------------------------

    @PluginMethod
    fun getDecks(call: PluginCall) {
        if (!hasAnkiDroidPermission()) {
            call.reject("Permission not granted", "PERMISSION_DENIED")
            return
        }
        try {
            val decks = JSArray()
            val cursor = context.contentResolver.query(DECKS_URI, null, null, null, null)
            cursor?.use {
                val idCol = it.getColumnIndex("deck_id")
                val nameCol = it.getColumnIndex("deck_name")
                val descCol = it.getColumnIndex("deck_desc")
                val countCol = it.getColumnIndex("deck_count")
                val dynCol = it.getColumnIndex("deck_dyn")

                while (it.moveToNext()) {
                    val deck = JSObject()
                    deck.put("id", it.getString(idCol) ?: "")
                    deck.put("name", it.getString(nameCol) ?: "")
                    deck.put("description", if (descCol >= 0) it.getString(descCol) ?: "" else "")
                    deck.put("isDynamic", if (dynCol >= 0) it.getInt(dynCol) == 1 else false)

                    val counts = JSObject()
                    if (countCol >= 0) {
                        try {
                            val countArray = JSONArray(it.getString(countCol))
                            counts.put("learn", countArray.optInt(0, 0))
                            counts.put("review", countArray.optInt(1, 0))
                            counts.put("new", countArray.optInt(2, 0))
                        } catch (_: Exception) {
                            counts.put("learn", 0)
                            counts.put("review", 0)
                            counts.put("new", 0)
                        }
                    } else {
                        counts.put("learn", 0)
                        counts.put("review", 0)
                        counts.put("new", 0)
                    }
                    deck.put("counts", counts)
                    decks.put(deck)
                }
            }
            val result = JSObject()
            result.put("decks", decks)
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("Failed to query decks: ${e.message}", "UNKNOWN")
        }
    }

    @PluginMethod
    fun getModels(call: PluginCall) {
        if (!hasAnkiDroidPermission()) {
            call.reject("Permission not granted", "PERMISSION_DENIED")
            return
        }
        try {
            val models = JSArray()
            val cursor = context.contentResolver.query(MODELS_URI, null, null, null, null)
            cursor?.use {
                val idCol = it.getColumnIndex("_id")
                val nameCol = it.getColumnIndex("name")
                val fieldNamesCol = it.getColumnIndex("field_names")
                val numCardsCol = it.getColumnIndex("num_cards")
                val sortFieldCol = it.getColumnIndex("sort_field_index")
                val typeCol = it.getColumnIndex("type")

                while (it.moveToNext()) {
                    val model = JSObject()
                    model.put("id", it.getString(idCol) ?: "")
                    model.put("name", it.getString(nameCol) ?: "")
                    model.put("numCards", if (numCardsCol >= 0) it.getInt(numCardsCol) else 0)
                    model.put("sortFieldIndex", if (sortFieldCol >= 0) it.getInt(sortFieldCol) else 0)
                    model.put("type", if (typeCol >= 0) it.getInt(typeCol) else 0)

                    val fieldNamesArr = JSArray()
                    if (fieldNamesCol >= 0) {
                        val raw = it.getString(fieldNamesCol) ?: ""
                        raw.split(FIELD_SEPARATOR).forEach { name -> fieldNamesArr.put(name) }
                    }
                    model.put("fieldNames", fieldNamesArr)
                    models.put(model)
                }
            }
            val result = JSObject()
            result.put("models", models)
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("Failed to query models: ${e.message}", "UNKNOWN")
        }
    }

    @PluginMethod
    fun getModelIdsForDeck(call: PluginCall) {
        if (!hasAnkiDroidPermission()) {
            call.reject("Permission not granted", "PERMISSION_DENIED")
            return
        }
        val deckId = call.getString("deckId")
        if (deckId.isNullOrEmpty()) {
            call.reject("deckId is required", "INVALID_ARGUMENTS")
            return
        }
        try {
            val searchQuery = buildNoteSearchQuery(deckId = deckId)
            val uri = if (searchQuery != null) {
                NOTES_URI.buildUpon().appendQueryParameter("search", searchQuery).build()
            } else {
                NOTES_URI
            }
            val seen = mutableSetOf<String>()
            val modelIds = JSArray()
            val cursor = context.contentResolver.query(uri, null, null, null, null)
            cursor?.use {
                val midCol = it.getColumnIndex("mid")
                while (it.moveToNext()) {
                    val mid = if (midCol >= 0) it.getString(midCol) ?: "" else ""
                    if (mid.isNotEmpty() && seen.add(mid)) {
                        modelIds.put(mid)
                    }
                }
            }
            val result = JSObject()
            result.put("modelIds", modelIds)
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("Failed to query model IDs for deck: ${e.message}", "UNKNOWN")
        }
    }

    // -------------------------------------------------------------------------
    // Reading data
    // -------------------------------------------------------------------------

    @PluginMethod
    fun countNotes(call: PluginCall) {
        if (!hasAnkiDroidPermission()) {
            call.reject("Permission not granted", "PERMISSION_DENIED")
            return
        }
        try {
            val searchQuery = buildNoteSearchQuery(
                deckId = call.getString("deckId"),
                modelId = call.getString("modelId"),
                modifiedSince = call.getLong("modifiedSince"),
            )
            val uri = if (searchQuery != null) {
                NOTES_URI.buildUpon().appendQueryParameter("search", searchQuery).build()
            } else {
                NOTES_URI
            }
            val cursor = context.contentResolver.query(uri, arrayOf("_id"), null, null, null)
            val count = cursor?.use { it.count } ?: 0
            val result = JSObject()
            result.put("count", count)
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("Failed to count notes: ${e.message}", "UNKNOWN")
        }
    }

    @PluginMethod
    fun getNotesWithCards(call: PluginCall) {
        if (!hasAnkiDroidPermission()) {
            call.reject("Permission not granted", "PERMISSION_DENIED")
            return
        }
        try {
            val limit = call.getInt("limit") ?: DEFAULT_LIMIT
            val offset = call.getInt("offset") ?: 0
            val searchQuery = buildNoteSearchQuery(
                deckId = call.getString("deckId"),
                modelId = call.getString("modelId"),
                modifiedSince = call.getLong("modifiedSince"),
                extraSearch = call.getString("searchQuery"),
            )

            // Fetch all models up front for field name lookup
            val modelFieldNames = fetchModelFieldNames()

            val uri = if (searchQuery != null) {
                NOTES_URI.buildUpon().appendQueryParameter("search", searchQuery).build()
            } else {
                NOTES_URI
            }

            val requestedModelId = call.getString("modelId")?.takeIf { it.isNotEmpty() }

            val cursor = context.contentResolver.query(uri, null, null, null, null)
                ?: run {
                    val result = JSObject()
                    result.put("data", JSArray())
                    result.put("totalCount", 0)
                    result.put("hasMore", false)
                    call.resolve(result)
                    return
                }

            cursor.use {
                val totalCount = it.count
                val data = JSArray()

                val idCol = it.getColumnIndex("_id")
                val guidCol = it.getColumnIndex("guid")
                val midCol = it.getColumnIndex("mid")
                val modCol = it.getColumnIndex("mod")
                val tagsCol = it.getColumnIndex("tags")
                val fldsCol = it.getColumnIndex("flds")
                val sfldCol = it.getColumnIndex("sfld")

                // Seek to offset
                if (offset > 0 && !it.moveToPosition(offset)) {
                    // Offset beyond end — return empty page
                    val result = JSObject()
                    result.put("data", data)
                    result.put("totalCount", totalCount)
                    result.put("hasMore", false)
                    call.resolve(result)
                    return
                } else if (offset == 0) {
                    if (!it.moveToFirst()) {
                        val result = JSObject()
                        result.put("data", data)
                        result.put("totalCount", totalCount)
                        result.put("hasMore", false)
                        call.resolve(result)
                        return
                    }
                }

                var count = 0
                do {
                    val noteId = it.getString(idCol) ?: continue
                    val modelId = if (midCol >= 0) it.getString(midCol) ?: "" else ""
                    if (requestedModelId != null && modelId != requestedModelId) continue
                    val rawFields = if (fldsCol >= 0) it.getString(fldsCol) ?: "" else ""
                    val fieldValues = rawFields.split(FIELD_SEPARATOR)
                    val fieldNames = modelFieldNames[modelId] ?: emptyList()

                    val fields = JSObject()
                    fieldNames.forEachIndexed { i, name ->
                        fields.put(name, fieldValues.getOrElse(i) { "" })
                    }
                    // Include unnamed fields by index if model is unknown
                    if (fieldNames.isEmpty()) {
                        fieldValues.forEachIndexed { i, value ->
                            fields.put("field$i", value)
                        }
                    }

                    val tagsRaw = if (tagsCol >= 0) it.getString(tagsCol) ?: "" else ""
                    val tags = JSArray()
                    tagsRaw.trim().split(" ").filter { t -> t.isNotEmpty() }.forEach { t -> tags.put(t) }

                    val note = JSObject()
                    note.put("id", noteId)
                    note.put("guid", if (guidCol >= 0) it.getString(guidCol) ?: "" else "")
                    note.put("modelId", modelId)
                    note.put("modifiedTimestamp", if (modCol >= 0) it.getLong(modCol) else 0L)
                    note.put("tags", tags)
                    note.put("fields", fields)
                    note.put("sortField", if (sfldCol >= 0) it.getString(sfldCol) ?: "" else "")

                    val cards = fetchCardsForNote(noteId)

                    val noteWithCards = JSObject()
                    noteWithCards.put("note", note)
                    noteWithCards.put("cards", cards)
                    data.put(noteWithCards)

                    count++
                } while (count < limit && it.moveToNext())

                val result = JSObject()
                result.put("data", data)
                result.put("totalCount", totalCount)
                result.put("hasMore", offset + count < totalCount)
                call.resolve(result)
            }
        } catch (e: Exception) {
            call.reject("Failed to query notes: ${e.message}", "UNKNOWN")
        }
    }

    @PluginMethod
    fun getNoteWithCards(call: PluginCall) {
        if (!hasAnkiDroidPermission()) {
            call.reject("Permission not granted", "PERMISSION_DENIED")
            return
        }
        val noteId = call.getString("noteId")
        if (noteId.isNullOrEmpty()) {
            call.reject("noteId is required", "INVALID_ARGUMENTS")
            return
        }
        try {
            val modelFieldNames = fetchModelFieldNames()
            val noteUri = Uri.parse("content://$AUTHORITY/notes/$noteId")
            val cursor = context.contentResolver.query(noteUri, null, null, null, null)
                ?: run {
                    call.reject("Note not found", "NOT_FOUND")
                    return
                }

            cursor.use {
                if (!it.moveToFirst()) {
                    call.reject("Note not found", "NOT_FOUND")
                    return
                }

                val idCol = it.getColumnIndex("_id")
                val guidCol = it.getColumnIndex("guid")
                val midCol = it.getColumnIndex("mid")
                val modCol = it.getColumnIndex("mod")
                val tagsCol = it.getColumnIndex("tags")
                val fldsCol = it.getColumnIndex("flds")
                val sfldCol = it.getColumnIndex("sfld")

                val modelId = if (midCol >= 0) it.getString(midCol) ?: "" else ""
                val rawFields = if (fldsCol >= 0) it.getString(fldsCol) ?: "" else ""
                val fieldValues = rawFields.split(FIELD_SEPARATOR)
                val fieldNames = modelFieldNames[modelId] ?: emptyList()

                val fields = JSObject()
                fieldNames.forEachIndexed { i, name ->
                    fields.put(name, fieldValues.getOrElse(i) { "" })
                }
                if (fieldNames.isEmpty()) {
                    fieldValues.forEachIndexed { i, value -> fields.put("field$i", value) }
                }

                val tagsRaw = if (tagsCol >= 0) it.getString(tagsCol) ?: "" else ""
                val tags = JSArray()
                tagsRaw.trim().split(" ").filter { t -> t.isNotEmpty() }.forEach { t -> tags.put(t) }

                val note = JSObject()
                note.put("id", it.getString(idCol) ?: noteId)
                note.put("guid", if (guidCol >= 0) it.getString(guidCol) ?: "" else "")
                note.put("modelId", modelId)
                note.put("modifiedTimestamp", if (modCol >= 0) it.getLong(modCol) else 0L)
                note.put("tags", tags)
                note.put("fields", fields)
                note.put("sortField", if (sfldCol >= 0) it.getString(sfldCol) ?: "" else "")

                val cards = fetchCardsForNote(noteId)
                val noteWithCards = JSObject()
                noteWithCards.put("note", note)
                noteWithCards.put("cards", cards)

                val result = JSObject()
                result.put("note", noteWithCards)
                call.resolve(result)
            }
        } catch (e: Exception) {
            call.reject("Failed to query note: ${e.message}", "UNKNOWN")
        }
    }

    // -------------------------------------------------------------------------
    // Writing data
    // -------------------------------------------------------------------------

    @PluginMethod
    fun addNote(call: PluginCall) {
        if (!hasAnkiDroidPermission()) {
            call.reject("Permission not granted", "PERMISSION_DENIED")
            return
        }
        val modelId = call.getString("modelId")
        val deckId = call.getString("deckId")
        val fieldsObj = call.getObject("fields")

        if (modelId.isNullOrEmpty() || deckId.isNullOrEmpty() || fieldsObj == null) {
            call.reject("modelId, deckId, and fields are required", "INVALID_ARGUMENTS")
            return
        }

        try {
            // Fetch field names for the model to build the \x1f-separated flds string
            val fieldNamesMap = fetchModelFieldNames()
            val fieldNames = fieldNamesMap[modelId]
                ?: run {
                    call.reject("Model not found: $modelId", "NOT_FOUND")
                    return
                }

            val fieldValues = fieldNames.map { name ->
                fieldsObj.optString(name, "")
            }
            val fldsValue = fieldValues.joinToString(FIELD_SEPARATOR)

            val tagsArray = call.getArray("tags", JSArray())
            val tagsStr = (0 until (tagsArray?.length() ?: 0))
                .map { tagsArray!!.getString(it) }
                .joinToString(" ")

            val values = android.content.ContentValues().apply {
                put("mid", modelId.toLongOrNull() ?: 0L)
                put("flds", fldsValue)
                put("tags", tagsStr)
            }

            val insertUri = NOTES_URI.buildUpon()
                .appendQueryParameter("deckId", deckId)
                .build()

            val resultUri = context.contentResolver.insert(insertUri, values)
                ?: run {
                    call.reject("Failed to insert note", "UNKNOWN")
                    return
                }

            val noteId = resultUri.lastPathSegment ?: ""
            val result = JSObject()
            result.put("noteId", noteId)
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("Failed to add note: ${e.message}", "UNKNOWN")
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private fun isAnkiDroidInstalled(): Boolean {
        return try {
            context.packageManager.getPackageInfo(ANKIDROID_PACKAGE, 0)
            true
        } catch (_: PackageManager.NameNotFoundException) {
            false
        }
    }

    private fun hasAnkiDroidPermission(): Boolean {
        return ContextCompat.checkSelfPermission(context, ANKIDROID_PERMISSION) ==
            PackageManager.PERMISSION_GRANTED
    }

    /**
     * Fetch all models and return a map of modelId → list of field names.
     * Used to convert the raw \x1f-separated flds string into named fields.
     */
    private fun fetchModelFieldNames(): Map<String, List<String>> {
        val map = mutableMapOf<String, List<String>>()
        val cursor = context.contentResolver.query(MODELS_URI, null, null, null, null) ?: return map
        cursor.use {
            val idCol = it.getColumnIndex("_id")
            val fieldNamesCol = it.getColumnIndex("field_names")
            while (it.moveToNext()) {
                val id = it.getString(idCol) ?: continue
                val raw = if (fieldNamesCol >= 0) it.getString(fieldNamesCol) ?: "" else ""
                map[id] = raw.split(FIELD_SEPARATOR).filter { name -> name.isNotEmpty() }
            }
        }
        return map
    }

    /**
     * Query all cards for a given note ID.
     * Uses the `notes/{noteId}/cards` ContentProvider path.
     */
    private fun fetchCardsForNote(noteId: String): JSArray {
        val cards = JSArray()
        val cardsUri = Uri.parse("content://$AUTHORITY/notes/$noteId/cards")
        val cursor = context.contentResolver.query(cardsUri, null, null, null, null) ?: return cards
        cursor.use {
            val idCol = it.getColumnIndex("_id")
            val noteIdCol = it.getColumnIndex("note_id")
            val ordCol = it.getColumnIndex("ord")
            val cardNameCol = it.getColumnIndex("card_name")
            val deckIdCol = it.getColumnIndex("deck_id")
            val questionCol = it.getColumnIndex("question_simple")
            val answerCol = it.getColumnIndex("answer_simple")

            while (it.moveToNext()) {
                val card = JSObject()
                card.put("id", if (idCol >= 0) it.getString(idCol) ?: "" else "")
                card.put("noteId", if (noteIdCol >= 0) it.getString(noteIdCol) ?: noteId else noteId)
                card.put("ordinal", if (ordCol >= 0) it.getInt(ordCol) else 0)
                card.put("cardName", if (cardNameCol >= 0) it.getString(cardNameCol) ?: "" else "")
                card.put("deckId", if (deckIdCol >= 0) it.getString(deckIdCol) ?: "" else "")
                card.put("questionSimple", if (questionCol >= 0) it.getString(questionCol) ?: "" else "")
                card.put("answerSimple", if (answerCol >= 0) it.getString(answerCol) ?: "" else "")
                cards.put(card)
            }
        }
        return cards
    }

    /**
     * Build an Anki browser search query string from the available filter parameters.
     * Returns null if no filters are active (query all notes).
     */
    private fun buildNoteSearchQuery(
        deckId: String? = null,
        modelId: String? = null,
        modifiedSince: Long? = null,
        extraSearch: String? = null,
    ): String? {
        val parts = mutableListOf<String>()

        if (!deckId.isNullOrEmpty()) {
            val deckName = fetchDeckName(deckId)
                ?: throw IllegalArgumentException("Deck not found for ID: $deckId")
            parts.add("deck:\"$deckName\"")
        }
        if (!modelId.isNullOrEmpty()) {
            val modelName = fetchModelName(modelId)
                ?: throw IllegalArgumentException("Model not found for ID: $modelId")
            parts.add("note:\"$modelName\"")
        }
        // modifiedSince filtering: Anki search syntax supports "edited:N" (edited within N days)
        // but not "edited after timestamp". We filter in-cursor instead — handled by caller
        // checking note.modifiedTimestamp after fetching. Documented here for clarity.

        if (!extraSearch.isNullOrEmpty()) {
            parts.add(extraSearch)
        }

        return if (parts.isEmpty()) null else parts.joinToString(" ")
    }

    private fun fetchDeckName(deckId: String): String? {
        val cursor = context.contentResolver.query(DECKS_URI, null, null, null, null) ?: return null
        return cursor.use {
            val idCol = it.getColumnIndex("deck_id")
            val nameCol = it.getColumnIndex("deck_name")
            while (it.moveToNext()) {
                if (it.getString(idCol) == deckId) return@use it.getString(nameCol)
            }
            null
        }
    }

    private fun fetchModelName(modelId: String): String? {
        val cursor = context.contentResolver.query(MODELS_URI, null, null, null, null) ?: return null
        return cursor.use {
            val idCol = it.getColumnIndex("_id")
            val nameCol = it.getColumnIndex("name")
            while (it.moveToNext()) {
                if (it.getString(idCol) == modelId) return@use it.getString(nameCol)
            }
            null
        }
    }
}
