"""Base models and utilities for MongoDB integration with Pydantic v2"""

from typing import Any
from pydantic_core import core_schema
from bson import ObjectId


class PyObjectId(str):
    """Custom ObjectId type for Pydantic v2
    
    This class allows seamless integration between MongoDB's ObjectId
    and Pydantic models. It handles validation, serialization, and
    deserialization of ObjectId fields.
    
    Usage:
        class MyModel(BaseModel):
            id: Optional[PyObjectId] = Field(default=None, alias="_id")
            user_id: PyObjectId
    """
    
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: Any,
    ) -> core_schema.CoreSchema:
        """Define the Pydantic core schema for ObjectId validation"""
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )
    
    @classmethod
    def validate(cls, v):
        """Validate and convert value to ObjectId"""
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str):
            if ObjectId.is_valid(v):
                return ObjectId(v)
        raise ValueError("Invalid ObjectId")
    
    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        """Define JSON schema for OpenAPI documentation"""
        field_schema.update(type="string")
