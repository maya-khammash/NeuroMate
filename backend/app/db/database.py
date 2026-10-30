# from sqlalchemy import create_engine, text
# from sqlalchemy.orm import sessionmaker, declarative_base
# from sqlalchemy.exc import SQLAlchemyError

# DATABASE_URL = "mysql+mysqlconnector://root:Zain%40303@localhost/app"

# engine = create_engine(
#     DATABASE_URL,
#     echo=True
# )

# SessionLocal = sessionmaker(bind=engine)
# Base = declarative_base()

# try:
#     print("✅ Database connection successful!")
# except SQLAlchemyError as e:
#     print("❌ Database connection failed!")
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError

DATABASE_URL = "mysql+mysqlconnector://root:Zain%40303@localhost/app"

engine = create_engine(
    DATABASE_URL,
    echo=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# ✅ هذه هي الدالة المهمة
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# اختبار الاتصال (اختياري)
try:
    with engine.connect() as conn:
        print("✅ Database connection successful!")
except SQLAlchemyError as e:
    print("❌ Database connection failed!", e)
