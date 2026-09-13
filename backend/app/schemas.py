from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

AttributeKey = Literal['intelligence','strength','discipline','health','focus']

class AuthLogin(BaseModel):
    username: str
    password: str

class AuthRegister(BaseModel):
    username: str = Field(min_length=3, max_length=40, pattern=r'^[A-Za-z0-9_\-]+$')
    display_name: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=6, max_length=128)

class QuestCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = ""
    category: AttributeKey = 'focus'
    difficulty: Literal['easy','medium','hard'] = 'medium'
    repeat_rule: Literal['once','daily','weekly'] = 'once'

class QuestPatch(BaseModel):
    title: str | None = None
    description: str | None = None
    category: AttributeKey | None = None
    difficulty: Literal['easy','medium','hard'] | None = None
    progress: int | None = None
    target: int | None = None

class AllocateStat(BaseModel):
    attribute: AttributeKey

class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
