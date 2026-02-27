interface ModalProps {
  children: React.ReactNode,
  isOpen: boolean,
  onClose: () => void
}


export default function Modal({ children, isOpen, onClose }: ModalProps) {
  if (isOpen) return (
    <div className="fixed bg-black/50 w-screen h-screen top-0 left-0 bottom-0 right-0">
      <div className="bg-white w-20 h-20">
        {children}
      </div>
    </div>
  )
}