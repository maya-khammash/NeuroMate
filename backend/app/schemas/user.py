from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    role: str   # admin | doctor | student


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
