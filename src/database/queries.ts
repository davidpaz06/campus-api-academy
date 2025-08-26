export const queries = {
  courses: {
    createCourse: `
      SELECT create_course(
        $1::course_insert_data, ARRAY[
        $2]::component_insert_data[]
      ) AS course_id
    `,

    getCourseById: `SELECT * FROM course c WHERE c.course_id = $1`,

    getCoursesByInstitution: `
      SELECT 
        c.course_id,
        c.course_name,
        c.course_summary,
        c.created_at
      FROM course c 
      WHERE c.institution_id = $1
        AND ($2::timestamptz IS NULL OR (c.created_at, c.course_id) < ($2::timestamptz, $3::uuid))
      ORDER BY c.created_at desc, c.course_id desc
      LIMIT $4
    `,

    getCoursesByName: `
  SELECT 
    c.course_id,
    c.course_name,
    c.course_summary,
    c.created_at,
    similarity(c.course_name, $2) AS name_similarity,
    similarity(c.course_summary, $2) AS summary_similarity
  FROM course c
  WHERE c.institution_id = $1
    AND (
      similarity(c.course_name, $2) > 0.2 OR 
      similarity(c.course_summary, $2) > 0.075
    )
    AND ($3::timestamptz IS NULL OR (c.created_at, c.course_id) < ($3::timestamptz, $4::uuid))
  ORDER BY name_similarity DESC, summary_similarity DESC, c.created_at DESC, c.course_id DESC
  LIMIT $5
    `,

    updateCourse: `
      UPDATE course 
      SET 
        course_name = COALESCE($1, course_name),
        course_summary = COALESCE($2, course_summary),
        course_description = COALESCE($3, course_description),
        course_image_id = COALESCE($4, course_image_id)
      WHERE course_id = $5
      RETURNING 
        course_id,
        course_name,
        course_summary,
        course_description,
        institution_id,
        course_image_id,
        created_at
    `,

    deleteCourse: `
      DELETE FROM course WHERE course_id = $1
    `,

    getCourseComponents: `
      SELECT 
        c.component_id,
        c.component_name,
        c.component_summary,
        c.context_body,
        c.component_type_id,
        c.position,
        c.parent_id,
        c.course_id,
        COALESCE(array_agg(lf.file_id) FILTER (WHERE lf.file_id IS NOT NULL), '{}') as file_ids
      FROM component c
      LEFT JOIN lesson_file lf ON c.component_id = lf.component_id
      WHERE c.course_id = $1
      GROUP BY c.component_id, c.component_name, c.component_summary, c.context_body, 
               c.component_type_id, c.position, c.parent_id, c.course_id
      ORDER BY c.position
    `,

    enrollStudent: `
      INSERT INTO course_enrollment (component_id, campus_user_id)
      VALUES ($1, $2)
      RETURNING course_enrollment_id, component_id, campus_user_id, enrolled_at
    `,

    getCourseEnrollments: `
      SELECT 
        ce.course_enrollment_id,
        ce.component_id,
        ce.campus_user_id,
        ce.enrolled_at
      FROM course_enrollment ce
      JOIN component c ON ce.component_id = c.component_id
      WHERE c.course_id = $1
        AND ($2::timestamptz IS NULL OR (ce.enrolled_at, ce.course_enrollment_id) < ($2::timestamptz, $3::uuid))
      ORDER BY ce.enrolled_at DESC, ce.course_enrollment_id DESC
      LIMIT $4
    `,
  },
};
