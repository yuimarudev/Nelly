use std::{env, error::Error};
use futures::stream::StreamExt;
use twilight_cache_inmemory::{InMemoryCache, ResourceType};
use twilight_gateway::{cluster::{Cluster, ShardScheme}, Event};
use twilight_http::Client as HttpClient;
use twilight_model::gateway::Intents;
use twilight_command_parser::{CommandParserConfig, Command};
use dotenv::dotenv;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error + Send + Sync>> {
  dotenv().ok();
  let token = env::var("token")?;
  let scheme = ShardScheme::Auto;
  let (cluster, mut events) = Cluster::builder(token.to_owned(), Intents::GUILD_MESSAGES)
  .shard_scheme(scheme).build().await?;
  let cluster_spawn = cluster.clone();

  tokio::spawn(async move {
    cluster_spawn.up().await;
  });

  let http = HttpClient::new(token);

  let cache = InMemoryCache::builder().resource_types(ResourceType::MESSAGE).build();
  while let Some((shard_id, event)) = events.next().await {
    cache.update(&event);
    tokio::spawn(async move {
      handler(shard_id, event, http)
    });
  }
  Ok(())
}

async fn handler(shard_id: u64, event: Event, http: HttpClient) {
  let parser = CommandParserConfig::new();
  parser.add_command("");
  match event {
    Event::MessageCreate(msg) => {
      
    },
    _ => unimplemented!()
  }
}