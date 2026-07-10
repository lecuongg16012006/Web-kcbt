-- Tạo database mới nếu chưa có
CREATE DATABASE KhoanCatBeTong;
GO

USE KhoanCatBeTong;
GO

-- Tạo bảng Contacts
CREATE TABLE Contacts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    ServiceRequired NVARCHAR(100),
    Address NVARCHAR(255),
    Message NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO
