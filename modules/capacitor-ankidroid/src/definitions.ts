export interface AnkiDroidPluginCard {
  id: string;
  front: string;
  back: string;
  intervalDays: number;
  deckName: string;
}

/**
 * Capacitor plugin interface for AnkiDroid ContentProvider access.
 * Implemented natively in Kotlin; bridged to JS via Capacitor.
 */
export interface AnkiDroidPlugin {
  /**
   * Check if AnkiDroid is installed and has granted permission.
   */
  checkPermission(): Promise<{ granted: boolean }>;

  /**
   * Request permission to access AnkiDroid data.
   */
  requestPermission(): Promise<{ granted: boolean }>;

  /**
   * Fetch all cards from AnkiDroid.
   */
  getCards(): Promise<{ cards: AnkiDroidPluginCard[] }>;

  /**
   * Add a new card to AnkiDroid.
   */
  addCard(options: {
    deckName: string;
    front: string;
    back: string;
  }): Promise<{ id: string }>;
}
