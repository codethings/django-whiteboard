import json
from asyncio import iscoroutine
from django.http import HttpResponseBadRequest

def expect_json_and_session_id(view_func):
    async def wrapper(request, *args, **kwargs):
        try:
            payload = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return HttpResponseBadRequest()
        request.payload = payload
        session_id = request.headers.get("session-id")
        if not session_id:
            return HttpResponseBadRequest()
        request.session_id = session_id
        return await view_func(request, *args, **kwargs)
        

    wrapper.csrf_exempt = True
    return wrapper
