// netlify/functions/update-manuscript.js
import fetch from 'node-fetch';

export async function handler(event) {
  try {
    const { manuscriptId, newDescription } = JSON.parse(event.body);

    // 🔹 GitHub repo details
    const repoOwner = 'aap2299';
    const repoName = 'aap2299.github.io';
    const filePath = 'manuscripts.json';
    const token = process.env.GITHUB_TOKEN; // stored securely in Netlify

    // 1️⃣ Get the current JSON file from GitHub
    const getFile = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!getFile.ok) {
      throw new Error('Failed to fetch manuscript file from GitHub');
    }

    const fileData = await getFile.json();
    const json = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));

    // 2️⃣ Update the matching manuscript
    const manuscript = json.find(m => m.id === manuscriptId);
    if (!manuscript) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Manuscript not found' }) };
    }

    manuscript.description = newDescription;

    // 3️⃣ Commit updated file back to GitHub
    const updatedContent = Buffer.from(JSON.stringify(json, null, 2)).toString('base64');

    const update = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Update description for manuscript ${manuscriptId}`,
        content: updatedContent,
        sha: fileData.sha
      })
    });

    if (!update.ok) {
      throw new Error('Failed to update manuscript file');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
