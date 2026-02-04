"use client";

const CORN_INVITE_URL =
  "https://discordapp.com/oauth2/authorize?client_id=461849775516418059&scope=bot&permissions=0";

export default function CornAddButton() {
  return (
    <button
      className="corn-button"
      onClick={() => (window.location.href = CORN_INVITE_URL)}
    >
      Add corn to your server!
    </button>
  );
}
