class ApiResponse {
  static success(res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) {
    const payload = { success: true, message };
    if (data !== null && data !== undefined) payload.data = data;
    if (meta) payload.meta = meta;
    return res.status(statusCode).json(payload);
  }

  static created(res, message = 'Created successfully', data = null) {
    return ApiResponse.success(res, { statusCode: 201, message, data });
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;
