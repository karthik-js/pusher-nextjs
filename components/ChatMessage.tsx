const messageBoxStyles = {
  maxWidth: '70%',
  flexGrow: 0
}

const messageStyles = { fontWeight: 500, lineHeight: 1.4 }

const ChatMessage = ({ position = 'left', message }: { position: string; message: string }) => {
  const isRight = position.toLowerCase() === 'right'

  const align = isRight ? 'text-right' : 'text-left'
  const justify = isRight ? 'justify-content-end' : 'justify-content-start'
  return (
    <div className={`w-100 my-1 d-flex ${justify}`}>
      <div className='bg-light rounded border border-gray p-2' style={messageBoxStyles}>
        <span className={`d-block text-secondary ${align}`} style={{ ...messageStyles, whiteSpace: 'pre-wrap' }}>
          {message}
        </span>
      </div>
    </div>
  )
}

export default ChatMessage
