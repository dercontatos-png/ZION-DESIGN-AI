import React from "react";

export const WHATSAPP_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNzUuMjE2IDE3NS41NTIiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgeDE9Ijg1LjkxNSIgeDI9Ijg2LjUzNSIgeTE9IjMyLjU2NyIgeTI9IjEzNy4wOTIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM1N2QxNjMiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMyM2IzM2EiLz48L2xpbmVhckdyYWRpZW50PjxmaWx0ZXIgaWQ9ImEiIHdpZHRoPSIxLjExNSIgaGVpZ2h0PSIxLjExNCIgeD0iLS4wNTciIHk9Ii0uMDU3IiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMuNTMxIi8+PC9maWx0ZXI+PC9kZWZzPjxwYXRoIGQ9Im01NC41MzIgMTM4LjQ1IDIuMjM1IDEuMzI0YzkuMzg3IDUuNTcxIDIwLjE1IDguNTE4IDMxLjEyNiA4LjUyM2guMDIzYzMzLjcwNyAwIDYxLjEzOS0yNy40MjYgNjEuMTUzLTYxLjEzNS4wMDYtMTYuMzM1LTYuMzQ5LTMxLjY5Ni0xNy44OTUtNDMuMjUxQTYwLjc1IDYwLjc1IDAgMCAwIDg3Ljk0IDI1Ljk4M2MtMzMuNzMzIDAtNjEuMTY2IDI3LjQyMy02MS4xNzggNjEuMTNhNjAuOTggNjAuOTggMCAwIDAgOS4zNDkgMzIuNTM1bDEuNDU1IDIuMzEyLTYuMTc5IDIyLjU1OHptLTQwLjgxMSAyMy41NDRMMjQuMTYgMTIzLjg4Yy02LjQzOC0xMS4xNTQtOS44MjUtMjMuODA4LTkuODIxLTM2Ljc3Mi4wMTctNDAuNTU2IDMzLjAyMS03My41NSA3My41NzgtNzMuNTUgMTkuNjgxLjAxIDM4LjE1NCA3LjY2OSA1Mi4wNDcgMjEuNTcyczIxLjUzNyAzMi4zODMgMjEuNTMgNTIuMDM3Yy0uMDE4IDQwLjU1My0zMy4wMjcgNzMuNTUzLTczLjU3OCA3My41NTNoLS4wMzJjLTEyLjMxMy0uMDA1LTI0LjQxMi0zLjA5NC0zNS4xNTktOC45NTR6bTAgMCIgZmlsbD0iI2IzYjNiMyIgZmlsdGVyPSJ1cmwoI2EpIi8+PHBhdGggZD0ibTEyLjk2NiAxNjEuMjM4IDEwLjQzOS0zOC4xMTRhNzMuNDIgNzMuNDIgMCAwIDEtOS44MjEtMzYuNzcyYy4wMTctNDAuNTU2IDMzLjAyMS03My41NSA3My41NzgtNzMuNTUgMTkuNjgxLjAxIDM4LjE1NCA3LjY2OSA1Mi4wNDcgMjEuNTcyczIxLjUzNyAzMi4zODMgMjEuNTMgNTIuMDM3Yy0uMDE4IDQwLjU1My0zMy4wMjcgNzMuNTUzLTczLjU3OCA3My41NTNoLS4wMzJjLTEyLjMxMy0uMDA1LTI0LjQxMi0zLjA5NC0zNS4xNTktOC45NTR6IiBmaWxsPSIjZmZmZmZmIi8+PHBhdGggZD0iTTg3LjE4NCAyNS4yMjdjLTMzLjczMyAwLTYxLjE2NiAyNy40MjMtNjEuMTc4IDYxLjEzYTYwLjk4IDYwLjk4IDAgMCAwIDkuMzQ5IDMyLjUzNWwxLjQ1NSAyLjMxMy02LjE3OSAyMi41NTggMjMuMTQ2LTYuMDY5IDIuMjM1IDEuMzI0YzkuMzg3IDUuNTcxIDIwLjE1IDguNTE3IDMxLjEyNiA4LjUyM2guMDIzYzMzLjcwNyAwIDYxLjE0LTI3LjQyNiA2MS4xNTMtNjEuMTM1YTYwLjc1IDYwLjc1IDAgMCAwLTE3Ljg5NS00My4yNTFBNjAuNzUgNjAuNzUgMCAwIDAtNDMuMjM1LTE3LjkyOHoiIGZpbGw9InVybCgjYikiLz48cGF0aCBkPSJNNjguNzcyIDU1LjYwM2MtMS4zNzgtMy4wNjEtMi44MjgtMy4xMjMtNC4xMzctMy4xNzZsLTMuNTI0LS4wNDNjLTEuMjI2IDAtMy4yMTguNDYtNC45MDIgMi4zcy02LjQzNSA2LjI4Ny02LjQzNSAxNS4zMzIgNi41ODggMTcuNzg1IDcuNTA2IDE5LjAxMyAxMi43MTggMjAuMzgxIDMxLjQwNSAyNy43NWMxNS41MjkgNi4xMjQgMTguNjg5IDQuOTA2IDIyLjA2MSA0LjZzMTAuODc3LTQuNDQ3IDEyLjQwOC04Ljc0IDEuNTMyLTcuOTcxIDEuMDczLTguNzQtMS42ODUtMS4yMjYtMy41MjUtMi4xNDYtMTAuODc3LTUuMzY3LTEyLjU2Mi01Ljk4MS0yLjkxLS45MTktNC4xMzcuOTIxLTQuNzQ2IDUuOTc5LTUuODE5IDcuMjA2LTIuMTQ0IDEuMzgxLTMuOTg0LjQ2Mi03Ljc2LTIuODYxLTE0Ljc4NC05LjEyNGMtNS40NjUtNC44NzMtOS4xNTQtMTAuODkxLTEwLjIyOC0xMi43M3MtLjExNC0yLjgzNS44MDgtMy43NTFjLjgyNS0uODI0IDEuODM4LTIuMTQ3IDIuNzU5LTMuMjJzMS4yMjQtMS44NCAxLjgzNi0zLjA2NS4zMDctMi4zMDEtLjE1My0zLjIyLTQuMDMyLTEwLjAxMS01LjY2Ni0xMy42NDciIGZpbGw9IiNmZmZmZmYiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==";

export function WhatsAppIcon({ className = "h-14 w-14" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 175.216 175.552"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dbWhatsappGrad" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#57d163" />
          <stop offset="1" stopColor="#23b33a" />
        </linearGradient>
        <filter id="dbWhatsappBlur" width="1.115" height="1.114" x="-.057" y="-.057" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="3.531" />
        </filter>
      </defs>
      <path
        d="m54.532 138.45 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.523h.023c33.707 0 61.139-27.426 61.153-61.135.006-16.335-6.349-31.696-17.895-43.251A60.75 60.75 0 0 0 87.94 25.983c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558zm-40.811 23.544L24.16 123.88c-6.438-11.154-9.825-23.808-9.821-36.772.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954zm0 0"
        fill="#b3b3b3"
        filter="url(#dbWhatsappBlur)"
      />
      <path
        d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
        fill="#ffffff"
      />
      <path
        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
        fill="url(#dbWhatsappGrad)"
      />
      <path
        d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
        fill="#ffffff"
        fillRule="evenodd"
      />
    </svg>
  );
}

export function WhatsAppSupportButton() {
  return (
    <a
      href="https://link.designbuilder.co/fale-com-suporte-db"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o suporte pelo WhatsApp"
      title="Falar com o suporte pelo WhatsApp"
      className="pointer-events-auto fixed bottom-[148px] right-4 z-[99999] flex h-[56px] w-[56px] items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none drop-shadow-2xl cursor-pointer"
      style={{
        width: "55.9979px",
        height: "55.9979px",
      }}
    >
      <WhatsAppIcon className="h-[56px] w-[56px]" />
    </a>
  );
}

export default WhatsAppSupportButton;
