import dynamic from 'next/dynamic';

const ClipboardModule = dynamic(() => import('@/components/ecosystem/ClipboardModule'), { ssr: false });
import { useParams } from 'next/navigation';

export default function ClipboardPage() {
  const params = useParams();
  const { roomId, setRoom } = useRoomStore();

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      setRoom(params.id, params.id, false);
    }
  }, [params.id, setRoom]);

  return <ClipboardModule />;
}
