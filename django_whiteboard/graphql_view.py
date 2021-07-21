from graphene_django.views import GraphQLView


class GraphQLView(GraphQLView):

    def execute_graphql_request(self, request, data, query, variables, operation_name, show_graphiql):
        res = super().execute_graphql_request(request, data, query, variables, operation_name, show_graphiql=show_graphiql)
        if res.errors:
            import traceback
            for e in res.errors:
                traceback.print_tb(e.original_error.__traceback__)
        return res


graphql_view = GraphQLView.as_view(graphiql=True)
graphql_view.csrf_exempt = True