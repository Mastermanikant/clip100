'use client';
import dynamic from 'next/dynamic';

const NotebookModule = dynamic(() => import('@/components/ecosystem/NotebookModule'), { ssr: false });
import { useParams } from 'next/navigation';

export default function NotebookPage() {
  const params = useParams();
  const { roomId, setRoom } = useRoomStore();

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      setRoom(params.id, params.id, false);
    }
  }, [params.id, setRoom]);

  return <NotebookModule />;
}
