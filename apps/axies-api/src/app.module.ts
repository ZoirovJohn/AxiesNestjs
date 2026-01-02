import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { AppResolver } from "./app.resolver";
import { ComponentsModule } from "./components/components.module";
import { DatabaseModule } from "./database/database.module";
import { T } from "./libs/types/common";
import { SocketModule } from "./socket/socket.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: true,
      path: "/graphql",
      subscriptions: {
        "graphql-ws": {
          path: "/graphql",
          onConnect: (context) => {
            const token =
              context.connectionParams?.authorization ||
              context.connectionParams?.Authorization ||
              context.connectionParams?.token;

            if (!token) {
              throw new Error("Missing auth token");
            }

            return { token };
          },
        },
      },

      context: ({ req, connection }) => {
        if (connection) {
          return connection.context;
        }
        return { req };
      },

      formatError: (error: T) => {
        const graphQLFormattedError = {
          code: error?.extensions?.code,
          message:
            error?.extensions?.exception?.response?.message ||
            error?.extensions?.response?.message ||
            error?.message,
        };
        console.log("GRAPHQL GLOBAL ERR:", graphQLFormattedError);
        return graphQLFormattedError;
      },
    }),
    ComponentsModule,
    DatabaseModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
