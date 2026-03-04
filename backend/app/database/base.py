"""DeclarativeBase and reusable type annotations for all models."""

import uuid
from typing import Annotated

from sqlalchemy import Uuid, String
from sqlalchemy.orm import DeclarativeBase, mapped_column


# Reusable annotated types
uuid_pk = Annotated[uuid.UUID, mapped_column(Uuid, primary_key=True, default=uuid.uuid4)]
str_10 = Annotated[str, mapped_column(String(10))]
str_20 = Annotated[str, mapped_column(String(20))]
str_100 = Annotated[str, mapped_column(String(100))]


class Base(DeclarativeBase):
    pass
