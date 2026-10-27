import { formatFileSize, isPreviewableImage } from "../../utils/files";

function FileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

export default function AttachmentList({ attachments, mine }) {
  return (
    <div className="mb-1.5 flex flex-col gap-1.5">
      {attachments.map((file) =>
        isPreviewableImage(file.type) ? (
          <a
            key={file.id}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open image ${file.name}`}
            className="block overflow-hidden rounded-xl"
          >
            <img
              src={file.url}
              alt={file.name}
              className="block max-h-56 max-w-full object-cover"
            />
          </a>
        ) : (
          <a
            key={file.id}
            href={file.url}
            download={file.name}
            aria-label={`Download ${file.name}`}
            className={`flex min-w-[190px] items-center gap-2.5 rounded-xl px-3 py-2 transition ${
              mine
                ? "bg-white/10 hover:bg-white/15"
                : "bg-[#f6f3f8] hover:bg-[#f0ebf4]"
            }`}
          >
            <span className={mine ? "text-[#E3C8F4]" : "text-[#7F5D99]"}>
              <FileIcon />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[11px] font-semibold">
                {file.name}
              </span>
              <span className="block text-[10px] opacity-70">
                {formatFileSize(file.size)}
              </span>
            </span>
          </a>
        )
      )}
    </div>
  );
}