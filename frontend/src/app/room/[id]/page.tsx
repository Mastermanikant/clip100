import dynamic from 'next/dynamic';

const RoomModule = dynamic(() => import('@/components/ecosystem/RoomModule'), { ssr: false });
import { useParams } from 'next/navigation';

export default function RoomPage() {
  const params = useParams();
  const { roomId, setRoom } = useRoomStore();

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      setRoom(params.id, params.id, false);
    }
  }, [params.id, setRoom]);

  return <RoomModule />;
}
