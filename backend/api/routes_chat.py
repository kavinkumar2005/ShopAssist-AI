from fastapi import APIRouter
from backend.database.models import ChatRequest, ChatResponse
from backend.rag.conversation import process_chat_message

router = APIRouter(prefix="/chat", tags=["AI Chat Assistant"])

@router.post("", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    response_data = process_chat_message(
        message=payload.message,
        conversation_id=payload.conversation_id,
        context_product_id=payload.context_product_id,
        user_id=payload.user_id or "default_user"
    )
    return response_data
