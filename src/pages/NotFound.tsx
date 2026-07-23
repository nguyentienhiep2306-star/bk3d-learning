import { Link } from 'react-router-dom'
import { Button, Card } from '../components/ui'

export function NotFound() {
  return (
    <Card className="mx-auto max-w-lg text-center">
      <h1 className="text-2xl font-bold">Không tìm thấy trang</h1>
      <p className="mt-2 text-[#4d6378]">Đường dẫn này không tồn tại hoặc bạn chưa có quyền truy cập.</p>
      <Link to="/"><Button className="mt-5">Về trang chủ</Button></Link>
    </Card>
  )
}
