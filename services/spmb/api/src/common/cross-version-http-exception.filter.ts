import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";

type CompatibleHttpException = {
  getStatus: () => number;
  getResponse: () => string | object;
};

type JsonResponse = {
  status: (statusCode: number) => JsonResponse;
  json: (payload: unknown) => JsonResponse;
};

function isCompatibleHttpException(exception: unknown): exception is CompatibleHttpException {
  return Boolean(
    exception
      && typeof exception === "object"
      && typeof (exception as CompatibleHttpException).getStatus === "function"
      && typeof (exception as CompatibleHttpException).getResponse === "function",
  );
}

@Catch()
export class CrossVersionHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<JsonResponse>();

    if (isCompatibleHttpException(exception)) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const payload = typeof body === "string"
        ? { statusCode: status, message: body }
        : body;
      return response.status(status).json(payload);
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
}
