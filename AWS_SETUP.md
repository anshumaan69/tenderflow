# AWS Setup Instructions for TenderFlow AI

Follow these steps to configure your AWS environment for the "Serverless" backend.

## 1. AWS S3 (Storage for PDFs)
1.  Log in to the **AWS Management Console**.
2.  Search for **S3** and click **Create bucket**.
3.  **Bucket Name**: `tenderflow-uploads-[your-name]` (must be unique).
4.  **Region**: Choose `us-east-1` (or your preferred region).
5.  **Block Public Access**: Keep all checked (Block all public access).
6.  Click **Create bucket**.
7.  **CORS Configuration** (Important for direct browser uploads):
    -   Go to the **Permissions** tab of your new bucket.
    -   Scroll to **Cross-origin resource sharing (CORS)**.
    -   Click **Edit** and paste:
        ```json
        [
            {
                "AllowedHeaders": ["*"],
                "AllowedMethods": ["PUT", "POST", "GET"],
                "AllowedOrigins": ["*"],
                "ExposeHeaders": ["ETag"]
            }
        ]
        ```
    -   *Note: For production, replace `AllowedOrigins` "*" with your actual domain.*

## 2. AWS Bedrock (The AI Brain)
1.  Search for **Bedrock** in the console.
2.  In the sidebar, click **Model access**.
3.  Click **Manage model access**.
4.  Check the box for **Anthropic / Claude 3 Haiku** (Best balance of speed and cost).
5.  Click **Request model access**. (Usually instant).

## 3. AWS Lambda (Optional - The Processor)
*Note: For this Next.js project, we can use API Routes as our "Serverless" functions. If you want a standalone Lambda:*

1.  Search for **Lambda**.
2.  Click **Create function**.
3.  **Function name**: `TenderFlowProcessor`.
4.  **Runtime**: `Node.js 20.x`.
5.  **Permissions**:
    -   Go to **Configuration** -> **Permissions**.
    -   Click the **Role name** to open IAM.
    -   Add policies: `AmazonS3ReadOnlyAccess` and `AmazonBedrockFullAccess`.

## 4. Environment Variables
Get your credentials to use in the Next.js app:
1.  Go to **IAM** -> **Users** -> **Create user**.
2.  Name: `tenderflow-app`.
3.  Attach policies: `AmazonS3FullAccess`, `AmazonBedrockFullAccess`.
4.  Create **Access Keys**.
5.  Add these to your `.env.local` file in the project:
    ```bash
    AWS_ACCESS_KEY_ID=...
    AWS_SECRET_ACCESS_KEY=...
    AWS_REGION=us-east-1
    AWS_BUCKET_NAME=tenderflow-uploads-[your-name]
    ```
