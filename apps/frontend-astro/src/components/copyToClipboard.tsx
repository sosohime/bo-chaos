import { memo, useState } from 'react';
import { ClipboardCopy, Check } from 'lucide-react';
import { Button } from '@mono/ui/button';

const CopyToClipboardButton = ({ text }: { text: string | (() => string) }) => {
  const [success, setSuccess] = useState(false);

  const handleClick = async () => {
    setSuccess(true);
    try {
      await navigator.clipboard.writeText(
        typeof text === 'string' ? text : text(),
      );
    } catch {
      console.error('Copy failed');
    } finally {
      setTimeout(() => {
        setSuccess(false);
      }, 1500);
    }
  };

  return (
    <div>
      <Button
        className="text-xs "
        variant="outline"
        size="sm"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleClick}
      >
        {success ? (
          <>
            <Check />
            Copied
          </>
        ) : (
          <>
            <ClipboardCopy />
            Copy To Clipboard
          </>
        )}
      </Button>
    </div>
  );
};

export default memo(CopyToClipboardButton);
