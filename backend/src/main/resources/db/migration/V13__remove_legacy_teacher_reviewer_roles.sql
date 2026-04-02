IF EXISTS (SELECT 1 FROM user_roles WHERE role IN ('TEACHER', 'REVIEWER'))
BEGIN
    INSERT INTO user_roles (user_id, role)
    SELECT DISTINCT ur.user_id, 'ADMIN'
    FROM user_roles ur
    WHERE ur.role IN ('TEACHER', 'REVIEWER')
      AND NOT EXISTS (
          SELECT 1
          FROM user_roles existing
          WHERE existing.user_id = ur.user_id
            AND existing.role = 'ADMIN'
      );
END;
GO

IF EXISTS (SELECT 1 FROM user_roles WHERE role IN ('TEACHER', 'REVIEWER'))
BEGIN
    DELETE FROM user_roles
    WHERE role IN ('TEACHER', 'REVIEWER');
END;
GO

IF EXISTS (SELECT 1 FROM role_permissions WHERE role IN ('TEACHER', 'REVIEWER'))
BEGIN
    DELETE FROM role_permissions
    WHERE role IN ('TEACHER', 'REVIEWER');
END;
GO
