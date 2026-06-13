## ADDED Requirements

### Requirement: R2 client configured
The system SHALL create S3Client configured for Cloudflare R2 using AWS SDK v3.

#### Scenario: Client initialization
- **WHEN** R2 client is imported
- **THEN** S3Client is configured with R2 credentials and endpoint

#### Scenario: Environment variables used
- **WHEN** R2 client initializes
- **THEN** uses R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY from env

### Requirement: Upload function defined
The system SHALL provide uploadToR2 function that accepts key, body, contentType and metadata.

#### Scenario: Successful upload
- **WHEN** uploadToR2 is called with valid buffer
- **THEN** file is uploaded to R2 and returns key, size, checksum

#### Scenario: Upload failure retry
- **WHEN** upload fails with network error
- **THEN** function retries up to 3 times before throwing

### Requirement: Signed URL generation
The system SHALL provide getSignedUrl function that generates pre-signed URLs with expiry.

#### Scenario: Download URL
- **WHEN** getSignedUrl is called with purpose "download"
- **THEN** returns URL valid for 10 minutes with Content-Disposition header

#### Scenario: Preview URL
- **WHEN** getSignedUrl is called with purpose "preview"
- **THEN** returns URL valid for 10 minutes without download header

### Requirement: Asset key naming convention
The system SHALL generate keys following pattern: {userId}/{projectId}/{assetId}.{ext}

#### Scenario: Key generation
- **WHEN** generateAssetKey is called with userId, projectId, assetId
- **THEN** returns "user_abc/proj_123/asset_xyz.mp3"

#### Scenario: Extension preservation
- **WHEN** content type is "audio/mpeg"
- **THEN** key uses .mp3 extension

### Requirement: Delete function defined
The system SHALL provide deleteFromR2 function that removes object by key.

#### Scenario: Successful deletion
- **WHEN** deleteFromR2 is called with valid key
- **THEN** object is removed from R2

#### Scenario: Delete non-existent key
- **WHEN** deleteFromR2 is called with key that doesn't exist
- **THEN** function succeeds without error (idempotent)
