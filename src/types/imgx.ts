export type PostV2ChaptersByIdPageAccess200DataPagesItemGrant = {
  version: 1;
  algorithm: "IMGX-GRANT-WRAP-v1";
  codecVersions: [2, 3];
  defaultCodecVersion: 3;
  contentAlgorithm: "IMGX-AES-256-GCM-HKDF-v3";
  legacyAlgorithm: "IMGX-HMAC-SHA256-v2";
  /** @minLength 1 */
  imageId: string;
  /**
   * @minimum 0
   * @maximum 9007199254740991
   */
  issuedAt: number;
  /**
   * @maximum 9007199254740991
   * @exclusiveMinimum 0
   */
  expiresAt: number;
  /** @minLength 1 */
  nonce: string;
  /** @minLength 1 */
  keyNonce: string;
  /** @minLength 1 */
  keyHash: string;
  /** @minLength 1 */
  contentKeyHash: string;
  /** @minLength 1 */
  signature: string;
  /** @minLength 1 */
  wrappedDecodeKey: string;
  /** @minLength 1 */
  wrappedContentKey: string;
};